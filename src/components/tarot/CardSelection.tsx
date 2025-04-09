
import React, { useState, useEffect } from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useTranslation } from 'react-i18next';
import GlitchText from '@/components/GlitchText';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

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

  // Empty state - no cards available
  if (availableCards.length === 0 && !loading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-6 max-w-md mx-auto">
          <div className="mb-4 flex justify-center">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            <GlitchText text={t('tarot.noMoreReadings')} />
          </h3>
          <p className="text-gray-600 text-sm">
            {t('tarot.comeBackTomorrow')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800">
          <GlitchText text={t('tarot.selectCards')} goldEffect />
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
                    ? 'bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-400/50 shadow-md' 
                    : 'border border-dashed border-amber-300 bg-white'
                } flex items-center justify-center relative overflow-hidden`}
                initial={selected ? { scale: 0.8 } : {}}
                animate={selected ? { scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {loading && !selected ? (
                  <Skeleton className="w-full h-full rounded-md" />
                ) : selected ? (
                  <motion.div 
                    className="h-full w-full flex items-center justify-center"
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img
                      src={cardBackImage}
                      alt="Selected Card"
                      className="h-full w-full object-cover rounded-md"
                    />
                    <motion.div 
                      className="absolute inset-0 bg-amber-400/20 rounded-md"
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
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
