
import { useState } from 'react';
import { Card, ReadingCard, WebhookResponse, Deck, Interpretation } from '@/types/tarot';
import { toast } from 'sonner';
import { 
  getRandomCards, 
  getCardsByIndices, 
  generateIntroMessage, 
  generateCardInterpretation, 
  generateFinalMessage 
} from '@/services/tarot-service';

export const useTarotOperations = () => {
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
      let parsedWebhookResponse = webhookResponse;
      if (webhookResponse && typeof webhookResponse.returnwebhoock === 'string') {
        try {
          console.log("Parsing webhook response:", webhookResponse.returnwebhoock);
          const parsedData = JSON.parse(webhookResponse.returnwebhoock);
          parsedWebhookResponse = parsedData;
          console.log("Parsed webhook data:", parsedData);
        } catch (error) {
          console.error("Error parsing webhook response:", error);
        }
      }
      
      // Get cards for selection
      let randomCards;
      if (parsedWebhookResponse && Array.isArray(parsedWebhookResponse.selected_cards) && parsedWebhookResponse.selected_cards.length > 0) {
        // We'll use webhook cards when revealed, but for selection we show random ones
        randomCards = getRandomCards(selectedDeck, 6);
      } else {
        randomCards = getRandomCards(selectedDeck, 6);
      }
      
      setAvailableCards(randomCards);
      return true;
    } catch (error) {
      console.error("Error preparing card selection:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCardReveal = async (
    index: number,
    selectedCards: ReadingCard[],
    setSelectedCards: (cards: ReadingCard[]) => void,
    webhookResponse: WebhookResponse | null,
    intention: string,
    selectedDeck: Deck
  ) => {
    const card = selectedCards[index];
    if (!card || card.revealed) return false;
    
    try {
      setLoading(true);
      
      // Parse webhook response if available
      let parsedWebhookResponse = webhookResponse;
      if (webhookResponse && typeof webhookResponse.returnwebhoock === 'string') {
        try {
          const parsedData = JSON.parse(webhookResponse.returnwebhoock);
          parsedWebhookResponse = parsedData;
        } catch (error) {
          console.error("Error parsing webhook response:", error);
        }
      }
      
      // If we have webhook data with selected cards, and this is the first card reveal,
      // replace the selected cards with the ones from the webhook
      if (parsedWebhookResponse && 
          Array.isArray(parsedWebhookResponse.selected_cards) && 
          parsedWebhookResponse.selected_cards.length > 0 &&
          selectedCards.every(c => !c.revealed)) {
        
        const webhookCards = getCardsByIndices(selectedDeck, parsedWebhookResponse.selected_cards);
        if (webhookCards.length > 0) {
          // Replace all cards but keep the current request to reveal
          const newSelectedCards = webhookCards.map((card, i) => ({
            ...card,
            revealed: i === index,
            interpretation: i === index ? 
              `Para tu intención "${intention}", la carta ${card.name} sugiere que estás en un momento de transformación. Esta energía te invita a confiar en tu intuición y seguir adelante con confianza en el camino que has elegido.` : 
              undefined
          }));
          
          setSelectedCards(newSelectedCards);
          setLoading(false);
          return true;
        }
      }
      
      // Regular card reveal flow
      const interpretation = await generateCardInterpretation(card.id, intention);
      
      const updatedCards = [...selectedCards];
      updatedCards[index] = {
        ...card,
        interpretation,
        revealed: true
      };
      
      setSelectedCards(updatedCards);
      return true;
    } catch (error) {
      console.error("Error revealing card:", error);
      toast.error("Error al revelar la carta. Inténtalo de nuevo.", {
        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateInterpretation = async (
    selectedCards: ReadingCard[],
    intention: string,
    webhookMessage?: string | WebhookResponse | null
  ): Promise<Interpretation> => {
    setLoading(true);
    try {
      // Parse webhook message if it's a complex object with returnwebhoock
      let message = '';
      
      if (webhookMessage) {
        if (typeof webhookMessage === 'string') {
          message = webhookMessage;
        } else if (typeof webhookMessage === 'object') {
          // Try to parse returnwebhoock if available
          if (webhookMessage.returnwebhoock && typeof webhookMessage.returnwebhoock === 'string') {
            try {
              const parsedData = JSON.parse(webhookMessage.returnwebhoock);
              message = parsedData.message || '';
            } catch (error) {
              console.error("Error parsing webhook message:", error);
            }
          } else if (webhookMessage.message) {
            message = webhookMessage.message;
          }
        }
      }
      
      const finalMessage = await generateFinalMessage(selectedCards, intention, message);
      
      // Create interpretation object
      const interpretation: Interpretation = {
        summary: finalMessage,
        cards: selectedCards.reduce((acc, card) => {
          if (card.interpretation) {
            acc[card.id] = card.interpretation;
          }
          return acc;
        }, {} as {[key: string]: string})
      };
      
      return interpretation;
    } catch (error) {
      console.error("Error generating interpretation:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    prepareCardSelection,
    handleCardReveal,
    generateInterpretation
  };
};
