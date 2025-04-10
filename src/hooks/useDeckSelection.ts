
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DeckInfo } from '@/utils/deck-utils';
import { callSelectDeckWebhook } from '@/services/webhook';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useWallet } from '@/contexts/WalletContext';
import { useTarot } from '@/contexts/TarotContext';

export const useDeckSelection = (availableDecks: DeckInfo[]) => {
  const [openDeckId, setOpenDeckId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [selectingDeck, setSelectingDeck] = useState<string | null>(null);
  const { webhooks, environment } = useEnvironment();
  const { userData } = useWallet();
  const { selectedDeck, setSelectedDeck } = useTarot();

  // Check if images are loaded
  useEffect(() => {
    const checkImageExists = (imagePath: string) => {
      return new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imagePath;
      });
    };

    const verifyImages = async () => {
      const results: Record<string, boolean> = {};
      
      for (const deck of availableDecks) {
        results[deck.id] = await checkImageExists(deck.backImage);
      }
      
      setLoadedImages(results);
    };

    verifyImages();
  }, [availableDecks]);

  const handleSelectDeck = (deckId: string) => {
    const deck = availableDecks.find(d => d.id === deckId);
    if (deck && deck.unlocked && deck.isActive) {
      setSelectedDeck(deck.name);
    }
  };

  const handleServerSelectDeck = async (deckName: string) => {
    if (!userData?.userId) {
      return;
    }
    
    setSelectingDeck(deckName);
    
    try {
      const webhookUrl = environment === 'development' 
        ? 'https://primary-production-fe05.up.railway.app/webhook-test/f5891d06-7565-4582-bb27-de1f0c3db08e'
        : 'https://primary-production-fe05.up.railway.app/webhook/f5891d06-7565-4582-bb27-de1f0c3db08e';
      
      const success = await callSelectDeckWebhook(
        webhookUrl,
        userData.userId,
        deckName,
        environment
      );
      
      if (success) {
        const selectedDeckInfo = availableDecks.find(d => d.name === deckName);
        if (selectedDeckInfo) {
          setSelectedDeck(deckName);
        }
      }
    } catch (error) {
      console.error('Error selecting deck:', error);
    } finally {
      setSelectingDeck(null);
    }
  };

  const openDeckDetails = (deckId: string) => {
    const deck = availableDecks.find(d => d.id === deckId);
    if (deck && deck.unlocked && deck.isActive) {
      setOpenDeckId(deckId);
    }
  };

  const closeDeckDetails = () => {
    setOpenDeckId(null);
  };
  
  const viewCard = (cardId: string) => {
    setSelectedCard(cardId);
  };
  
  const closeCardView = () => {
    setSelectedCard(null);
  };

  return {
    openDeckId,
    selectedCard,
    loadedImages,
    selectingDeck,
    handleSelectDeck,
    handleServerSelectDeck,
    openDeckDetails,
    closeDeckDetails,
    viewCard,
    closeCardView
  };
};
