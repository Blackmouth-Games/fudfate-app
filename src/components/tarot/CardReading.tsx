
import React, { useState, useEffect } from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import GlitchText from '@/components/GlitchText';
import { motion } from 'framer-motion';
import { getCardBackPath } from '@/utils/deck-utils';

interface CardReadingProps {
  className?: string;
}

const CardReading: React.FC<CardReadingProps> = ({ className = '' }) => {
  const { selectedCards, revealCard, loading, finalMessage, resetReading, introMessage, webhookResponse, selectedDeck } = useTarot();
  const { t } = useTranslation();
  
  // State for webhook message
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);
  
  // Track which cards have been flipped to prevent multiple flips
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  
  console.log("CardReading rendering with:", {
    cardBackImage: getCardBackPath(selectedDeck),
    selectedCards: selectedCards?.length || 0,
    selectedDeck,
    finalMessage: !!finalMessage,
    webhookResponse: webhookResponse,
  });
  
  // Parse webhook message if available
  useEffect(() => {
    if (webhookResponse && typeof webhookResponse === 'object') {
      try {
        // Try to get message directly from the response
        if (webhookResponse.message) {
          setWebhookMessage(webhookResponse.message);
          return;
        }
        
        // Try to parse returnwebhoock if it exists
        if (typeof webhookResponse.returnwebhoock === 'string') {
          try {
            const parsedData = JSON.parse(webhookResponse.returnwebhoock);
            if (parsedData && parsedData.message) {
              setWebhookMessage(parsedData.message);
            }
            
            // For debugging in DevTools - log selected cards from webhook
            if (parsedData && Array.isArray(parsedData.selected_cards)) {
              console.log("Webhook selected cards:", parsedData.selected_cards);
            }
          } catch (error) {
            console.error("Error parsing webhook message in CardReading:", error);
          }
        }
      } catch (error) {
        console.error("Error processing webhook response in CardReading:", error);
      }
    }
  }, [webhookResponse]);
  
  // Card back image based on selected deck
  const cardBackImage = getCardBackPath(selectedDeck);
  
  // Handle card click with animation - only allow one flip per card
  const handleCardClick = async (index: number) => {
    // Check if card is already revealed or is currently being flipped
    if (selectedCards[index]?.revealed || loading || flippedCards[index]) return;
    
    // Mark this card as flipped to prevent multiple flips
    setFlippedCards(prev => ({ ...prev, [index]: true }));
    
    console.log(`Revealing card ${index}`, selectedCards[index]?.id);
    
    // Reveal the card
    setTimeout(() => {
      revealCard(index);
    }, 300);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800">
          <GlitchText 
            text={finalMessage 
              ? t('tarot.readingComplete') 
              : t('tarot.revealCards')} 
            intensity="normal"
            neonEffect="purple"
          />
        </h3>
        <p className="text-gray-600 text-sm">
          {finalMessage 
            ? t('tarot.readingCompleteDescription') 
            : webhookMessage 
              ? webhookMessage 
              : t('tarot.tapToReveal')}
        </p>
      </div>
      
      {!finalMessage ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {selectedCards.map((card, index) => (
            <div 
              key={card?.id || `card-${index}`}
              className="flex flex-col items-center space-y-3"
            >
              <div className="perspective-1000 w-full max-w-[200px] aspect-[2/3]">
                <motion.div 
                  className={`relative w-full h-full transition-transform duration-1000 transform-style-3d cursor-pointer`}
                  style={{ 
                    transformStyle: "preserve-3d",
                    transform: card?.revealed ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                  onClick={() => !card?.revealed && !loading && handleCardClick(index)}
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
                      onError={(e) => {
                        console.warn(`Failed to load card back image: ${cardBackImage}, using fallback`);
                        e.currentTarget.src = `/img/cards/deck_1/99_BACK.png`;
                      }}
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
                    {card && (
                      <div className="p-3 h-full flex flex-col">
                        <div className="text-center font-bold text-amber-700 mb-2 bg-amber-50/50 py-1 rounded truncate">
                          {card.name}
                        </div>
                        <div className="flex-1 flex items-center justify-center p-2">
                          <img 
                            src={card.image} 
                            alt={card.name} 
                            className="max-h-full max-w-full object-contain drop-shadow-md"
                            onError={(e) => {
                              console.warn(`Failed to load card image: ${card.image}, using fallback`);
                              e.currentTarget.src = `/img/cards/deck_1/0_TheDegen.png`;
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-amber-200 shadow-md">
            <h4 className="font-bold mb-3 text-center text-gray-800">
              <GlitchText text={t('tarot.finalMessage')} intensity="normal" neonEffect="purple" />
            </h4>
            <p className="italic text-gray-700 text-center">
              "{finalMessage}"
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {selectedCards.map((card, index) => (
              <div 
                key={card?.id || `card-${index}`}
                className="aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-white border border-amber-300 shadow-md hover:shadow-lg transition-shadow"
              >
                {card && (
                  <div className="p-2 h-full flex flex-col">
                    <div className="text-center text-xs font-bold text-amber-700 mb-1 bg-amber-50 p-1 rounded truncate">
                      {card.name}
                    </div>
                    <div className="flex-1 flex items-center justify-center p-1">
                      <img 
                        src={card.image} 
                        alt={card.name} 
                        className="max-h-full object-contain drop-shadow-sm"
                        onError={(e) => {
                          console.warn(`Failed to load card image: ${card.image}, using fallback`);
                          e.currentTarget.src = `/img/cards/deck_1/0_TheDegen.png`;
                        }}
                      />
                    </div>
                  </div>
                )}
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
