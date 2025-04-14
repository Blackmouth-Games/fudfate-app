
import React, { useState, useEffect } from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useTranslation } from 'react-i18next';
import GlitchText from '@/components/GlitchText';
import { getCardBackPath } from '@/utils/deck-utils';
import CompletedReading from './CompletedReading';
import CardRevealContainer from './CardRevealContainer';
import ShareReading from './ShareReading';

interface CardReadingProps {
  className?: string;
}

const CardReading: React.FC<CardReadingProps> = ({ className = '' }) => {
  const { selectedCards, revealCard, loading, finalMessage, resetReading, webhookResponse, selectedDeck } = useTarot();
  const { t } = useTranslation();
  
  // State for webhook message
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);
  
  console.log("CardReading rendering with:", {
    cardBackImage: getCardBackPath(selectedDeck),
    selectedCards: selectedCards?.length || 0,
    selectedDeck,
    finalMessage: !!finalMessage,
    webhookResponse: webhookResponse,
  });
  
  // Parse webhook message if available
  useEffect(() => {
    if (webhookResponse) {
      try {
        // Handle case where webhookResponse is an array
        if (Array.isArray(webhookResponse) && webhookResponse.length > 0) {
          const firstResponse = webhookResponse[0];
          
          // Try to get message directly
          if (firstResponse.message) {
            setWebhookMessage(firstResponse.message);
            return;
          }
          
          // Try to parse returnwebhoock
          if (typeof firstResponse.returnwebhoock === 'string') {
            try {
              const parsedData = JSON.parse(firstResponse.returnwebhoock);
              if (parsedData && parsedData.message) {
                setWebhookMessage(parsedData.message);
                console.log("Found message in parsed webhook array:", parsedData.message);
              }
            } catch (error) {
              console.error("Error parsing webhook message in CardReading:", error);
            }
          }
        } 
        // Handle case where webhookResponse is an object
        else if (typeof webhookResponse === 'object' && webhookResponse !== null) {
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
                console.log("Found message in parsed webhook object:", parsedData.message);
              }
            } catch (error) {
              console.error("Error parsing webhook message in CardReading:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error processing webhook response in CardReading:", error);
      }
    }
  }, [webhookResponse]);
  
  // Card back image based on selected deck
  const cardBackImage = getCardBackPath(selectedDeck);

  // Debug the selected cards
  useEffect(() => {
    console.log("CardReading - Selected Cards:", selectedCards);
  }, [selectedCards]);

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
      </div>
      
      {!finalMessage ? (
        <CardRevealContainer 
          selectedCards={selectedCards}
          handleCardClick={revealCard}
          loading={loading}
          webhookMessage={webhookMessage}
          cardBackImage={cardBackImage}
        />
      ) : (
        <>
          <CompletedReading 
            finalMessage={finalMessage}
            selectedCards={selectedCards}
            resetReading={resetReading}
          />
          <ShareReading className="mt-6" />
        </>
      )}
    </div>
  );
};

export default CardReading;
