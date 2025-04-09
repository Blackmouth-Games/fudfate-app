
import React, { useState } from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import GlitchText from '@/components/GlitchText';
import { motion } from 'framer-motion';

interface CardReadingProps {
  className?: string;
}

const CardReading: React.FC<CardReadingProps> = ({ className = '' }) => {
  const { selectedCards, revealCard, loading, finalMessage, resetReading } = useTarot();
  const { t } = useTranslation();
  
  // Card back images
  const cardBackImage = "/img/cards/carddeck1/card_back.jpg";
  
  // Track flipping state for animation
  const [flippingCards, setFlippingCards] = useState<{[key: number]: boolean}>({});
  
  // Handle card click with animation
  const handleCardClick = async (index: number) => {
    if (selectedCards[index].revealed || loading) return;
    
    // Set card as flipping
    setFlippingCards(prev => ({ ...prev, [index]: true }));
    
    // Wait for flip animation before revealing
    setTimeout(() => {
      revealCard(index);
      // Reset flipping state
      setTimeout(() => {
        setFlippingCards(prev => ({ ...prev, [index]: false }));
      }, 600);
    }, 600);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800">
          <GlitchText text={finalMessage 
            ? t('tarot.readingComplete') 
            : t('tarot.revealYourDestiny')} 
          />
        </h3>
        <p className="text-gray-600 text-sm">
          {finalMessage 
            ? t('tarot.readingCompleteDescription') 
            : t('tarot.tapToReveal')}
        </p>
      </div>
      
      {!finalMessage ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {selectedCards.map((card, index) => (
            <div 
              key={card.id}
              className="flex flex-col items-center space-y-3"
            >
              <div className="perspective-1000 w-full max-w-[200px] aspect-[2/3]">
                <motion.div 
                  className={`relative w-full h-full transition-transform duration-1000 transform-style-3d cursor-pointer`}
                  style={{ 
                    transformStyle: "preserve-3d",
                    transform: (card.revealed || flippingCards[index]) ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                  onClick={() => !card.revealed && !loading && handleCardClick(index)}
                >
                  {/* Card Back */}
                  <div 
                    className="absolute w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg shadow-md backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <img 
                      src={cardBackImage} 
                      alt="Card Back" 
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* Card Front */}
                  <div 
                    className="absolute w-full h-full bg-gradient-to-br from-amber-100 to-white border-2 border-amber-300 rounded-lg shadow-lg backface-hidden"
                    style={{ 
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)"
                    }}
                  >
                    <div className="p-3 h-full flex flex-col">
                      <div className="text-center font-bold text-amber-700 mb-2 bg-amber-50/50 py-1 rounded truncate">
                        {card.name}
                      </div>
                      <div className="flex-1 flex items-center justify-center p-2">
                        <img 
                          src={card.image} 
                          alt={card.name} 
                          className="max-h-full max-w-full object-contain drop-shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {card.revealed && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-4 rounded-lg border border-amber-200 shadow-md"
                >
                  <p className="text-sm italic text-gray-700">
                    "{card.interpretation}"
                  </p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-amber-200 shadow-md">
            <h4 className="font-bold mb-3 text-center text-gray-800">
              <GlitchText text={t('tarot.finalMessage')} />
            </h4>
            <p className="italic text-gray-700 text-center">
              "{finalMessage}"
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {selectedCards.map((card, index) => (
              <div 
                key={card.id}
                className="aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-white border border-amber-300 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-2 h-full flex flex-col">
                  <div className="text-center text-xs font-bold text-amber-700 mb-1 bg-amber-50 p-1 rounded truncate">
                    {card.name}
                  </div>
                  <div className="flex-1 flex items-center justify-center p-1">
                    <img 
                      src={card.image} 
                      alt={card.name} 
                      className="max-h-full object-contain drop-shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center pt-4">
            <Button
              onClick={resetReading}
              className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-medium"
            >
              {t('tarot.startNewReading')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardReading;
