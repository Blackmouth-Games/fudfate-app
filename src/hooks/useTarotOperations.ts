
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

  const handleCardReveal = async (
    index: number,
    selectedCards: ReadingCard[],
    setSelectedCards: (cards: ReadingCard[]) => void,
    webhookResponse: WebhookResponse | null,
    intention: string,
    selectedDeck: Deck,
    setFinalMessage: (message: string | null) => void
  ) => {
    const card = selectedCards[index];
    if (!card || card.revealed) return false;
    
    try {
      setLoading(true);
      
      // Skip temporary webhook responses
      if (!webhookResponse || webhookResponse.isTemporary === true) {
        console.log("Waiting for non-temporary webhook response...");
        toast.error("Reading data not ready yet. Please wait a moment and try again.");
        setLoading(false);
        return false;
      }
      
      console.log("Using non-temporary webhook response for card reveal:", webhookResponse);
      
      // Parse webhook response to extract card indices and message
      let webhookCards: number[] = [];
      let webhookMessage: string | undefined;
      let webhookQuestion: string | undefined;
      
      // Process webhook data to extract card indices and message
      if (webhookResponse) {
        // Try to get selected_cards directly from the response
        if (Array.isArray(webhookResponse.selected_cards)) {
          webhookCards = webhookResponse.selected_cards;
          console.log("Found selected_cards in webhook:", webhookCards);
        }
        
        // Try to get message directly from the response
        if (webhookResponse.message) {
          webhookMessage = webhookResponse.message;
        }
        
        // Try to get question directly from the response
        if (webhookResponse.question) {
          webhookQuestion = webhookResponse.question;
        }
        
        // Try to parse returnwebhoock if it exists
        if (typeof webhookResponse.returnwebhoock === 'string') {
          try {
            const parsedData = JSON.parse(webhookResponse.returnwebhoock);
            
            if (Array.isArray(parsedData.selected_cards)) {
              webhookCards = parsedData.selected_cards;
              console.log("Found selected_cards in parsed webhook:", webhookCards);
            }
            
            if (parsedData.message) {
              webhookMessage = parsedData.message;
            }
            
            if (parsedData.question) {
              webhookQuestion = parsedData.question;
            }
          } catch (error) {
            console.error("Error parsing webhook response:", error);
          }
        }
      }
      
      // If we have webhook cards, use them regardless of whether this is first reveal
      if (webhookCards.length > 0) {
        console.log("Using webhook cards for reveal. Selected deck:", selectedDeck);
        
        // Get cards from webhook indices
        const webhookDeckCards = getCardsByIndices(selectedDeck, webhookCards);
        console.log("Cards from webhook indices:", webhookDeckCards);
        
        if (webhookDeckCards.length > 0) {
          // If this is the first reveal, replace all cards
          const isFirstReveal = selectedCards.every(c => !c.revealed);
          
          if (isFirstReveal) {
            // Get interpretation for the revealed card
            let interpretation;
            try {
              if (webhookDeckCards[index] && webhookDeckCards[index].id) {
                interpretation = await generateCardInterpretation(webhookDeckCards[index].id, intention);
              }
            } catch (error) {
              console.error("Error generating interpretation:", error);
            }
            
            // Replace all cards but keep the current request to reveal
            const newSelectedCards = webhookDeckCards.map((card, i) => ({
              ...card,
              deck: selectedDeck, // Ensure the deck is explicitly set
              revealed: i === index,
              interpretation: i === index ? interpretation : undefined
            }));
            
            console.log("Setting new selected cards from webhook:", newSelectedCards);
            setSelectedCards(newSelectedCards);
          } else {
            // Just reveal the current card using the webhook data
            const webhookCard = webhookDeckCards[index];
            if (webhookCard) {
              const interpretation = await generateCardInterpretation(webhookCard.id, intention);
              
              const updatedCards = [...selectedCards];
              updatedCards[index] = {
                ...webhookCard,
                deck: selectedDeck, // Ensure the deck is explicitly set
                interpretation,
                revealed: true
              };
              
              setSelectedCards(updatedCards);
            }
          }
          
          setLoading(false);
          return true;
        }
      }
      
      // If we don't have webhook cards or couldn't use them, just reveal the current card
      console.log("Revealing selected card normally:", card);
      const interpretation = await generateCardInterpretation(card.id, intention);
      
      const updatedCards = [...selectedCards];
      updatedCards[index] = {
        ...card,
        interpretation,
        revealed: true
      };
      
      setSelectedCards(updatedCards);
      
      // Check if all cards are revealed, and if so, show the webhook message
      const allRevealed = updatedCards.every(c => c.revealed);
      if (allRevealed && webhookMessage) {
        console.log("All cards revealed, showing webhook message:", webhookMessage);
        const finalMessageWithQuestion = webhookQuestion 
          ? `${webhookQuestion}\n\n${webhookMessage}` 
          : webhookMessage;
        setFinalMessage(finalMessageWithQuestion);
      }
      
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
      let question = '';
      
      if (webhookMessage) {
        if (typeof webhookMessage === 'string') {
          message = webhookMessage;
        } else if (typeof webhookMessage === 'object') {
          // Try to get message directly
          if (webhookMessage.message) {
            message = webhookMessage.message;
          }
          // Try to get question directly
          if (webhookMessage.question) {
            question = webhookMessage.question;
          }
          // Try to parse returnwebhoock if available
          else if (webhookMessage.returnwebhoock && typeof webhookMessage.returnwebhoock === 'string') {
            try {
              const parsedData = JSON.parse(webhookMessage.returnwebhoock);
              message = parsedData.message || '';
              question = parsedData.question || '';
            } catch (error) {
              console.error("Error parsing webhook message:", error);
            }
          }
        }
      }
      
      // Only generate a final message if we don't have one from the webhook
      const finalMessage = message || await generateFinalMessage(selectedCards, intention, message);
      
      // Format final message with question if available
      const formattedMessage = question 
        ? `${question}\n\n${finalMessage}` 
        : finalMessage;
      
      // Create interpretation object
      const interpretation: Interpretation = {
        summary: formattedMessage, // Use the formatted message with question
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

export default useTarotOperations;
