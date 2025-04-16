import { useState } from 'react';
import { ReadingCard, WebhookResponse, Deck } from '@/types/tarot';
import { generateCardInterpretation } from '@/services/tarot-service';
import { toast } from 'sonner';
import tarotCards from '@/data/tarotCards';

// Helper function to get card by numeric index for a specific deck
const getCardByIndex = (index: number, selectedDeck: Deck): ReadingCard | undefined => {
  // Filter cards by deck first
  const deckCards = tarotCards.filter(card => card.deck === selectedDeck);
  
  // Get the card by its numeric ID from the image filename
  const card = deckCards.find(card => {
    // Extract numeric ID from the image path
    // Format: /img/cards/deck_X/6_TheFork.jpg
    const filename = card.image.split('/').pop() || '';
    const numericId = parseInt(filename.split('_')[0]);
    return numericId === index;
  });

  if (!card) return undefined;

  // Convert TarotCard to ReadingCard
  return {
    ...card,
    revealed: false,
    interpretation: '',
    deck: selectedDeck
  };
};

export const useCardReveal = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isWaitingForWebhook, setIsWaitingForWebhook] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

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
      
      // Check if we have a final webhook response
      if (!webhookResponse || webhookResponse.isTemporary === true) {
        console.log(`Waiting for non-temporary webhook response... (attempt ${retryCount + 1})`);
        setIsWaitingForWebhook(true);
        setRetryCount(prev => prev + 1);
        
        if (retryCount > 2) {
          toast.error("Reading data not ready yet. Please wait a moment and try again.", {
            duration: 3000,
            position: 'bottom-center'
          });
        } else {
          toast.error("Reading data not ready yet. Please wait a moment and try again.");
        }
        
        return false;
      }
      
      // Reset the retry counter and waiting state when we have a valid response
      setRetryCount(0);
      setIsWaitingForWebhook(false);
      
      // Get card index from webhook response
      const webhookCardIndex = webhookResponse.selected_cards?.[index];
      
      if (webhookCardIndex === undefined) {
        console.error('No card index found in webhook response for position:', index);
        return false;
      }
      
      // Get the card by its numeric index from the selected deck
      const webhookCard = getCardByIndex(webhookCardIndex, selectedDeck);
      
      if (!webhookCard) {
        console.error('Card not found for webhook index:', webhookCardIndex, 'in deck:', selectedDeck);
        return false;
      }
      
      console.log(`Revealing card at index ${index}:`, {
        position: index,
        webhookCardIndex,
        webhookCard,
        deck: selectedDeck,
        imagePath: webhookCard.image,
        allWebhookCards: webhookResponse.selected_cards
      });
      
      // Get interpretation for the revealed card
      const interpretation = await generateCardInterpretation(webhookCard.id, intention);
      
      const updatedCards = [...selectedCards];
      updatedCards[index] = {
        ...webhookCard,
        interpretation,
        revealed: true,
        deck: selectedDeck
      };
      
      setSelectedCards(updatedCards);
      
      // Check if all cards are revealed, and if so, show the webhook message
      const allRevealed = updatedCards.every(c => c.revealed);
      if (allRevealed && webhookResponse.message) {
        const finalMessageWithQuestion = webhookResponse.question 
          ? `${webhookResponse.question}\n\n${webhookResponse.message}` 
          : webhookResponse.message;
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

  return {
    loading,
    isWaitingForWebhook,
    handleCardReveal
  };
};
