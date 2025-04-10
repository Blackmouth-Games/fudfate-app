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
      
      // Get all 22 cards from the current deck for selection
      // We're no longer only showing 6 cards, we're showing all deck cards
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
      let webhookCards: number[] = [];
      
      if (webhookResponse) {
        // Try to get selected_cards directly from the response
        if (Array.isArray(webhookResponse.selected_cards)) {
          webhookCards = webhookResponse.selected_cards;
        }
        
        // Try to parse returnwebhoock if it exists
        if (typeof webhookResponse.returnwebhoock === 'string') {
          try {
            const parsedData = JSON.parse(webhookResponse.returnwebhoock);
            parsedWebhookResponse = parsedData;
            
            if (Array.isArray(parsedData.selected_cards)) {
              webhookCards = parsedData.selected_cards;
            }
          } catch (error) {
            console.error("Error parsing webhook response:", error);
          }
        }
      }
      
      // If we have webhook data with selected cards, and this is the first card reveal,
      // replace the selected cards with the ones from the webhook
      if (webhookCards.length > 0 && selectedCards.every(c => !c.revealed)) {
        console.log("Using webhook cards for reveal:", webhookCards);
        console.log("Current selected deck:", selectedDeck);
        
        const webhookDeckCards = getCardsByIndices(selectedDeck, webhookCards);
        console.log("Cards by indices:", webhookDeckCards);
        
        if (webhookDeckCards.length > 0) {
          // Replace all cards but keep the current request to reveal
          const newSelectedCards = webhookDeckCards.map((card, i) => ({
            ...card,
            revealed: i === index,
            interpretation: undefined
          }));
          
          setSelectedCards(newSelectedCards);
          setLoading(false);
          return true;
        }
      }
      
      // If we don't have webhook cards or couldn't use them, just reveal the current card
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
      toast.error("Error revealing card. Please try again.", {
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
