
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/types/tarot';
import { useTarot } from '@/contexts/TarotContext';

interface CardSelectionDeckProps {
  allDeckCards: Card[];
  loading: boolean;
  selectedCardId: string | null;
  animatingToSlot: number | null;
  selectedCards: any[];
  cardBackImage: string;
  handleCardSelect: (cardId: string) => void;
}

const CardSelectionDeck: React.FC<CardSelectionDeckProps> = ({
  allDeckCards,
  loading,
  selectedCardId,
  animatingToSlot,
  selectedCards,
  cardBackImage,
  handleCardSelect
}) => {
  const { t } = useTranslation();
  const { phase, setPhase } = useTarot();

  // Function to continue to reading phase
  const handleContinueToReading = () => {
    setPhase('reading');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-48">
              <motion.div 
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Skeleton className="absolute w-full h-full rounded-lg" />
              </motion.div>
              <motion.div 
                animate={{ rotate: [5, -5, 5] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
              >
                <Skeleton className="absolute w-full h-full rounded-lg transform rotate-6" />
              </motion.div>
              <motion.div 
                animate={{ rotate: [-2, 8, -2] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
              >
                <Skeleton className="absolute w-full h-full rounded-lg transform -rotate-6" />
              </motion.div>
            </div>
          </div>
          <motion.p 
            className="text-amber-600 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            {t('tarot.preparingCards')}
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] sm:h-[50vh] overflow-visible">
      <div className="absolute inset-0 px-4">
        <div className="flex flex-wrap justify-center">
          <AnimatePresence>
            {allDeckCards.map((card, index) => {
              // Skip cards that have already been selected
              if (selectedCards.some(sc => sc.id === card.id)) {
                return null;
              }
              
              const isSelected = card.id === selectedCardId;
              const angle = ((index - allDeckCards.length / 2) / allDeckCards.length) * 40;
              const baseZIndex = index;
              
              // Calculate the target position for animation (if this card is being animated to a slot)
              const isAnimating = isSelected && animatingToSlot !== null;
              
              // Calculate positions in the fan arrangement
              let xPos = 50 + (index - allDeckCards.length / 2) * 3;
              // Ensure the position stays within visible bounds
              xPos = Math.max(10, Math.min(90, xPos));
              
              return (
                <motion.div
                  key={card.id}
                  className={`cursor-pointer absolute tarot-selection-card ${isSelected ? 'z-50' : ''}`}
                  initial={{ 
                    left: `${xPos}%`, 
                    top: `${50 + (index % 4) * 5}px`,
                    rotate: angle,
                    scale: 1,
                    zIndex: baseZIndex
                  }}
                  animate={isAnimating ? {
                    left: '50%',
                    top: '0px',
                    rotate: 0,
                    scale: 0.9,
                    zIndex: 100,
                    opacity: 0,
                    transition: { duration: 0.5, ease: "easeInOut" }
                  } : {
                    left: `${xPos}%`, 
                    top: `${50 + (index % 4) * 5}px`,
                    rotate: angle,
                    scale: 1,
                    zIndex: baseZIndex,
                    opacity: 1,
                    transition: { duration: 0.3 }
                  }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                  whileHover={!isAnimating ? { 
                    y: -20, 
                    scale: 1.1,
                    zIndex: 50,
                    transition: { duration: 0.2 } 
                  } : {}}
                  onClick={() => !isAnimating && handleCardSelect(card.id)}
                  style={{
                    transform: `translateX(-50%)`,
                    width: '120px'
                  }}
                >
                  <AspectRatio ratio={2/3}>
                    <div className="w-full h-full rounded-lg shadow-md overflow-hidden flex items-center justify-center border-2 border-amber-200/50 hover:border-amber-400 transition-colors">
                      <motion.img 
                        src={cardBackImage} 
                        alt="Tarot Card Back"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to default image if the dynamic path fails
                          console.warn(`Failed to load image: ${cardBackImage}, using fallback`);
                          e.currentTarget.src = `/img/cards/deck_1/99_BACK.png`;
                        }}
                      />
                    </div>
                  </AspectRatio>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Continue button if exactly 3 cards are selected */}
      {selectedCards.length === 3 && (
        <div className="mt-8 flex justify-center">
          <Button 
            variant="default" 
            className="bg-amber-600 hover:bg-amber-700 px-6"
            disabled={loading}
            onClick={handleContinueToReading}
          >
            {t('tarot.continueToReading')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CardSelectionDeck;
