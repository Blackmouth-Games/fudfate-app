import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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
  const { phase } = useTarot();

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

  const handleContinue = () => {
    if (selectedCards.length === 3) {
      // The parent component should handle this navigation
      // We don't need to do anything here - the parent component manages phase transitions
    }
  };

  return (
    <motion.div 
      className="relative h-[60vh] sm:h-[50vh] overflow-visible"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-gradient-to-r from-amber-50/50 to-amber-100/30 rounded-lg p-4 mb-6 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-amber-700 text-sm">
          {t('tarot.selectCardsDescription', { selected: selectedCards.length, total: 3 })}
        </p>
      </motion.div>
      
      <div className="absolute inset-0 px-4">
        <div className="flex flex-wrap justify-center">
          <AnimatePresence>
            {allDeckCards.map((card, index) => {
              const isSelected = card.id === selectedCardId;
              
              const spreadFactor = Math.min(40 / allDeckCards.length, 2);
              const angle = ((index - allDeckCards.length / 2) / allDeckCards.length) * 40;
              
              const baseZIndex = index;
              
              const isAnimating = isSelected && animatingToSlot !== null;
              
              let xPos = 50 + (index - allDeckCards.length / 2) * spreadFactor;
              xPos = Math.max(10, Math.min(90, xPos));
              
              const yVariation = Math.sin(index * 0.5) * 10;
              
              return (
                <motion.div
                  key={card.id}
                  className={`cursor-pointer absolute tarot-selection-card ${isSelected ? 'z-50' : ''}`}
                  initial={{ 
                    left: `${xPos}%`, 
                    top: `${50 + yVariation}px`,
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
                    transition: { duration: 0.5, ease: "easeInOut" }
                  } : {
                    left: `${xPos}%`, 
                    top: `${50 + yVariation}px`,
                    rotate: angle,
                    scale: 1,
                    zIndex: baseZIndex,
                    transition: { duration: 0.3 }
                  }}
                  whileHover={!isAnimating ? { 
                    y: -30, 
                    scale: 1.2,
                    zIndex: 50,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
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
      
      {selectedCards.length === 3 && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 pb-4 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            variant="default" 
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 font-medium shadow-md"
            disabled={loading}
            onClick={handleContinue}
          >
            {t('tarot.continueToReading')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CardSelectionDeck;
