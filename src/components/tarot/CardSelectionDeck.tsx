
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
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
  
  // Ensure all image paths use .jpg instead of .png
  const backImage = cardBackImage.replace('.png', '.jpg');

  useEffect(() => {
    if (selectedCards.length === 3) {
      const timer = setTimeout(() => {
        setPhase('reading');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [selectedCards.length, setPhase]);

  const getCardBorderColor = (index: number) => {
    const colors = [
      'border-purple-400',
      'border-indigo-400',
      'border-blue-400',
      'border-teal-400',
      'border-green-400',
      'border-yellow-400',
      'border-amber-400',
      'border-orange-400',
      'border-red-400',
      'border-pink-400'
    ];
    return colors[index % colors.length];
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
              if (selectedCards.some(sc => sc.id === card.id)) {
                return null;
              }
              
              const isSelected = card.id === selectedCardId;
              const angle = ((index - allDeckCards.length / 2) / allDeckCards.length) * 40;
              const baseZIndex = index;
              
              const isAnimating = isSelected && animatingToSlot !== null;
              
              let xPos = 50 + (index - allDeckCards.length / 2) * 3;
              xPos = Math.max(10, Math.min(90, xPos));
              
              const borderColor = getCardBorderColor(index);
              
              return (
                <motion.div
                  key={card.id}
                  className={`cursor-pointer absolute tarot-selection-card ${isSelected ? 'z-50' : ''} ${borderColor}`}
                  initial={{ 
                    left: `${xPos}%`, 
                    top: `${50 + (index % 4) * 5}px`,
                    rotate: angle,
                    scale: 1,
                    zIndex: baseZIndex,
                    y: 0
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
                  exit={{ opacity: 0, scale: 0.8, y: -30, transition: { duration: 0.3 } }}
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
                  <AspectRatio ratio={5/8}>
                    <div className="w-full h-full rounded-lg shadow-md overflow-hidden flex items-center justify-center border-2 hover:border-amber-400 transition-colors">
                      <motion.img 
                        src={backImage} 
                        alt="Tarot Card Back"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.warn(`Failed to load image: ${backImage}, using fallback`);
                          e.currentTarget.src = `/img/cards/deck_1/99_BACK.jpg`;
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
    </div>
  );
};

export default CardSelectionDeck;
