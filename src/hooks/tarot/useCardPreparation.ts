
import { useState } from 'react';
import { Card, Deck, WebhookResponse } from '@/types/tarot';
import { generateIntroMessage, getRandomCards } from '@/services/tarot-service';

export const useCardPreparation = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const prepareCardSelection = async (
    intention: string,
    selectedDeck: Deck,
    webhookResponse: WebhookResponse | null,
    setIntroMessage: (message: string) => void,
    setAvailableCards: (cards: Card[]) => void
  ) => {
    setLoading(true);
    try {
      // Generate intro message
      const intro = await generateIntroMessage(intention);
      setIntroMessage(intro);
      
      // Parse webhook response if available
      if (webhookResponse && typeof webhookResponse.returnwebhoock === 'string') {
        try {
          console.log("Parsing webhook response:", webhookResponse.returnwebhoock);
          const parsedData = JSON.parse(webhookResponse.returnwebhoock);
          console.log("Parsed webhook data:", parsedData);
        } catch (error) {
          console.error("Error parsing webhook response:", error);
        }
      }
      
      // Get all cards from the current deck for selection
      const randomCards = getRandomCards(selectedDeck, 22);
      setAvailableCards(randomCards);
      return true;
    } catch (error) {
      console.error("Error preparing card selection:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    prepareCardSelection
  };
};
