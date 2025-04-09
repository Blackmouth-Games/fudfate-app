
import React, { useState, useEffect } from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useTranslation } from 'react-i18next';
import GlitchText from '@/components/GlitchText';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface CardSelectionProps {
  className?: string;
}

const CardSelection: React.FC<CardSelectionProps> = ({ className = '' }) => {
  const { availableCards, selectedCards, selectCard, loading } = useTarot();
  const { t } = useTranslation();
  
  // Card back image
  const cardBackImage = "/img/cards/carddeck1/card_back.jpg";
  const [cardPositions, setCardPositions] = useState<{
    [key: string]: {
      left: number;
      top: number;
      rotation: number;
      zIndex: number;
    };
  }>({});

  // Generate random positions for cards that remain consistent
  useEffect(() => {
    const positions: {[key: string]: {left: number, top: number, rotation: number, zIndex: number}} = {};
    
    availableCards.forEach((card, index) => {
      positions[card.id] = {
        left: Math.floor(Math.random() * 65),
        top: Math.floor(Math.random() * 65),
        rotation: Math.floor(Math.random() * 30) - 15,
        zIndex: Math.floor(Math.random() * 10) + 1
      };
    });
    
    setCardPositions(positions);
  }, [availableCards]);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800">
          <GlitchText text={t('tarot.selectCards')} />
        </h3>
        <p className="text-gray-600 text-sm">
          {t('tarot.selectCardsDescription', { selected: selectedCards.length, total: 3 })}
        </p>
      </div>
      
      <div className="relative h-[400px] w-full bg-gradient-to-b from-amber-50/50 to-amber-100/30 rounded-lg my-8 border border-amber-200/30 overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-48 animate-pulse">
                  <Skeleton className="absolute w-full h-full rounded-lg" />
                  <Skeleton className="absolute w-full h-full rounded-lg transform rotate-6" />
                  <Skeleton className="absolute w-full h-full rounded-lg transform -rotate-6" />
                </div>
              </div>
              <p className="text-amber-600 font-medium">{t('tarot.preparingCards')}</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {availableCards.map((card) => {
              const position = cardPositions[card.id] || { left: 30, top: 30, rotation: 0, zIndex: 1 };
              
              return (
                <motion.div
                  key={card.id}
                  className="absolute cursor-pointer hover:shadow-xl transition-all duration-300 transform"
                  style={{
                    left: `${position.left}%`,
                    top: `${position.top}%`,
                    zIndex: position.zIndex,
                    width: '150px',
                    height: '225px',
                  }}
                  initial={{ opacity: 0, rotate: position.rotation, y: -100 }}
                  animate={{ opacity: 1, rotate: position.rotation, y: 0 }}
                  exit={{ opacity: 0, y: -100, transition: { duration: 0.5 } }}
                  transition={{ duration: 0.5, delay: position.zIndex * 0.1 }}
                  whileHover={{ y: -10, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" }}
                  onClick={() => selectCard(card.id)}
                >
                  <div className="w-full h-full rounded-lg shadow-md overflow-hidden flex items-center justify-center">
                    <motion.img 
                      src={cardBackImage} 
                      alt="Tarot Card Back"
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
      
      <div className="pt-4 border-t border-amber-200">
        <h4 className="text-center font-medium mb-4 text-gray-700">
          {t('tarot.selectedCards', { count: selectedCards.length })}
        </h4>
        
        <div className="flex justify-center space-x-4">
          {Array.from({ length: 3 }).map((_, i) => {
            const selected = selectedCards[i];
            
            return (
              <motion.div
                key={`slot-${i}`}
                className={`w-16 h-24 sm:w-20 sm:h-28 rounded-md ${
                  selected 
                    ? 'bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-400/50' 
                    : 'border border-dashed border-amber-300 bg-white'
                } flex items-center justify-center`}
                initial={selected ? { scale: 0.8 } : {}}
                animate={selected ? { scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {loading && !selected ? (
                  <Skeleton className="w-full h-full rounded-md" />
                ) : selected ? (
                  <div className="text-2xl h-full w-full flex items-center justify-center">
                    <img
                      src={cardBackImage}
                      alt="Selected Card"
                      className="h-full w-full object-cover rounded-md"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-amber-400">{i + 1}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CardSelection;
