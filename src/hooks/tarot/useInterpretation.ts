
import { useState } from 'react';
import { ReadingCard, Interpretation, WebhookResponse } from '@/types/tarot';
import { generateFinalMessage } from '@/services/tarot-service';

export const useInterpretation = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const generateInterpretation = async (
    selectedCards: ReadingCard[],
    intention: string,
    webhookMessage?: string | WebhookResponse | null
  ): Promise<Interpretation> => {
    setLoading(true);
    try {
      let message = '';
      let question = '';
      
      if (webhookMessage) {
        if (typeof webhookMessage === 'string') {
          message = webhookMessage;
        } else if (typeof webhookMessage === 'object') {
          message = webhookMessage.message || '';
          question = webhookMessage.question || '';
          
          if (webhookMessage.returnwebhoock && typeof webhookMessage.returnwebhoock === 'string') {
            try {
              const parsedData = JSON.parse(webhookMessage.returnwebhoock);
              message = parsedData.message || message;
              question = parsedData.question || question;
            } catch (error) {
              console.error("Error parsing webhook message:", error);
            }
          }
        }
      }
      
      const finalMessage = message || await generateFinalMessage(selectedCards, intention, message);
      const formattedMessage = question 
        ? `${question}\n\n${finalMessage}` 
        : finalMessage;
      
      return {
        summary: formattedMessage,
        cards: selectedCards.reduce((acc, card) => {
          if (card.interpretation) {
            acc[card.id] = card.interpretation;
          }
          return acc;
        }, {} as {[key: string]: string})
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateInterpretation
  };
};
