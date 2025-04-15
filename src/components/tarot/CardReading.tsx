
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
  const { selectedCards, revealCard, loading, finalMessage, resetReading, webhookResponse, webhookError, selectedDeck } = useTarot();
  const { t } = useTranslation();
  
  // State for webhook message and question
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);
  const [webhookQuestion, setWebhookQuestion] = useState<string | null>(null);
  
  console.log("CardReading rendering with:", {
    cardBackImage: getCardBackPath(selectedDeck),
    selectedCards: selectedCards?.length || 0,
    selectedDeck,
    finalMessage: !!finalMessage,
    webhookResponse: webhookResponse,
    webhookError
  });
  
  // Parse webhook message and question if available
  useEffect(() => {
    if (webhookResponse) {
      try {
        // First clear the previous values when new response arrives
        setWebhookMessage(null);
        setWebhookQuestion(null);
        
        // Handle case where webhookResponse is an array
        if (Array.isArray(webhookResponse) && webhookResponse.length > 0) {
          const firstResponse = webhookResponse[0];
          
          // Try to get message directly
          if (firstResponse.message) {
            setWebhookMessage(firstResponse.message);
          }
          
          // Try to get question directly
          if (firstResponse.question) {
            setWebhookQuestion(firstResponse.question);
          }
          
          // Try to parse returnwebhoock
          if (typeof firstResponse.returnwebhoock === 'string') {
            try {
              const parsedData = JSON.parse(firstResponse.returnwebhoock);
              if (parsedData) {
                if (parsedData.message) {
                  setWebhookMessage(parsedData.message);
                  console.log("Found message in parsed webhook array:", parsedData.message);
                }
                if (parsedData.question) {
                  setWebhookQuestion(parsedData.question);
                  console.log("Found question in parsed webhook array:", parsedData.question);
                }
              }
            } catch (error) {
              console.error("Error parsing webhook message in CardReading:", error);
            }
          }
        } 
        // Handle case where webhookResponse is an object
        else if (typeof webhookResponse === 'object' && webhookResponse !== null) {
          // Skip if this is a temporary response
          if (webhookResponse.isTemporary) {
            console.log("Skipping temporary webhook response in CardReading");
            return;
          }
          
          // Try to get message directly from the response
          if (webhookResponse.message) {
            setWebhookMessage(webhookResponse.message);
          }
          
          // Try to get question directly from the response
          if (webhookResponse.question) {
            setWebhookQuestion(webhookResponse.question);
          }
          
          // Try to parse returnwebhoock if it exists
          if (typeof webhookResponse.returnwebhoock === 'string') {
            try {
              const parsedData = JSON.parse(webhookResponse.returnwebhoock);
              if (parsedData) {
                if (parsedData.message) {
                  setWebhookMessage(parsedData.message);
                  console.log("Found message in parsed webhook object:", parsedData.message);
                }
                if (parsedData.question) {
                  setWebhookQuestion(parsedData.question);
                  console.log("Found question in parsed webhook object:", parsedData.question);
                }
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
          webhookQuestion={webhookQuestion}
          cardBackImage={cardBackImage}
          error={webhookError}
        />
      ) : (
        <CompletedReading 
          finalMessage={finalMessage}
          selectedCards={selectedCards}
          resetReading={resetReading}
        />
      )}
    </div>
  );
};

export default CardReading;
