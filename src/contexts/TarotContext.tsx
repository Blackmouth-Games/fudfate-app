import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useWallet } from './WalletContext';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import tarotCards from '@/data/tarotCards';
import { 
  Card, 
  ReadingCard, 
  Deck, 
  ReadingPhase, 
  Interpretation, 
  WebhookResponse,
  TarotContextType 
} from '@/types/tarot';
import { 
  callReadingWebhook, 
  resetWebhookState, 
  getFinalWebhookResponse 
} from '@/services/webhook/reading';
import { getRandomCards, checkUserToken } from '@/services/tarot-service';
import { useTarotOperations } from '@/hooks/useTarotOperations';

const TarotContext = createContext<TarotContextType | undefined>(undefined);

export const TarotProvider = ({ children }: { children: ReactNode }) => {
  const { connected, walletAddress, walletType, network, userData } = useWallet();
  const { webhooks, environment } = useEnvironment();
  const { t } = useTranslation();
  const { loading, isWaitingForWebhook, prepareCardSelection, handleCardReveal, generateInterpretation } = useTarotOperations();
  
  const [selectedDeck, setSelectedDeck] = useState<Deck>('deck_1');
  const [intention, setIntention] = useState<string>('');
  const [phase, setPhase] = useState<ReadingPhase>('intention');
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<ReadingCard[]>([]);
  const [revealedCardIds, setRevealedCardIds] = useState<string[]>([]);
  const [introMessage, setIntroMessage] = useState<string | null>(null);
  const [finalMessage, setFinalMessage] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [webhookResponse, setWebhookResponse] = useState<WebhookResponse | null>(null);
  const [isCallingWebhook, setIsCallingWebhook] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      resetWebhookState();
    };
  }, []);

  // ---
  // Función robusta para extraer los datos finales del webhook (prioriza returnwebhoock si existe)
  function parseFinalWebhookData(webhookResponse) {
    if (!webhookResponse) return null;
    let parsed = null;
    if (typeof webhookResponse.returnwebhoock === 'string') {
      try {
        parsed = JSON.parse(webhookResponse.returnwebhoock);
      } catch (e) {
        parsed = null;
      }
    }
    // Si el returnwebhoock es válido y tiene selected_cards, usarlo
    if (parsed && Array.isArray(parsed.selected_cards)) {
      return {
        ...webhookResponse,
        ...parsed,
        selected_cards: parsed.selected_cards,
        deck: parsed.selected_deck || parsed.deck || webhookResponse.deck,
        message: parsed.message || webhookResponse.message,
        question: parsed.question || webhookResponse.question,
      };
    }
    // Si no, usar el objeto plano
    return webhookResponse;
  }

  const handleReadingReady = useCallback((event: CustomEvent) => {
    const readingData = event.detail;
    if (readingData && !readingData.isTemporary) {
      console.log("Reading ready event received:", readingData);
      // Usar el parser robusto
      const finalData = parseFinalWebhookData(readingData);
      setWebhookResponse(finalData);
      setWebhookError(null);
      // Update selected deck from webhook response if available
      let deckFromWebhook = null;
      if (finalData && finalData.deck) {
        setSelectedDeck(finalData.deck);
        deckFromWebhook = finalData.deck;
      } else if (finalData && finalData.returnwebhoock) {
        try {
          const parsedData = JSON.parse(finalData.returnwebhoock);
          if (parsedData.selected_deck) {
            setSelectedDeck(parsedData.selected_deck);
            deckFromWebhook = parsedData.selected_deck;
          }
        } catch (error) {
          console.error("Error parsing webhook response for deck:", error);
        }
      }
      setReadingDeck(deckFromWebhook || selectedDeck);
      console.log("Storing final webhook response for later use in reveal phase");
    }
  }, [selectedDeck]);

  const handleReadingError = useCallback((event: CustomEvent) => {
    const errorData = event.detail;
    console.error("Reading error event received:", errorData);
    setWebhookError(errorData.error);
    
    if (phase === 'preparing' || phase === 'selection') {
      toast.error(`Error getting reading: ${errorData.error}`, {
        duration: 5000
      });
    }
  }, [phase]);
  
  useEffect(() => {
    window.addEventListener('readingReady', handleReadingReady as EventListener);
    window.addEventListener('readingError', handleReadingError as EventListener);
    
    return () => {
      window.removeEventListener('readingReady', handleReadingReady as EventListener);
      window.removeEventListener('readingError', handleReadingError as EventListener);
    };
  }, [handleReadingReady, handleReadingError]);

  useEffect(() => {
    if ((phase === 'preparing' || phase === 'selection' || phase === 'reading') && 
        (webhookResponse?.isTemporary || !webhookResponse)) {
      
      const finalResponse = getFinalWebhookResponse();
      if (finalResponse && !finalResponse.isTemporary) {
        console.log("Found final webhook response in periodic check:", finalResponse);
        setWebhookResponse(finalResponse);
        setWebhookError(null);
      }
    }
  }, [phase, webhookResponse]);

  // ---
  // ¡ATENCIÓN! Lógica CRÍTICA para la sincronización del deck tras login/cambio de usuario o deckSelect:
  // Solo se debe actualizar el selectedDeck automáticamente cuando userData.selectedDeck cambie
  // (es decir, tras login o cambio de usuario), o cuando el backend confirme un cambio de deck (deckSelect).
  // NO sincronizar en otros flujos ni en cada render. Si se elimina o modifica esto, se pueden romper flujos de selección manual y causar bugs sutiles.
  // ---
  useEffect(() => {
    if (userData?.selectedDeck && userData.selectedDeck !== selectedDeck) {
      setSelectedDeck(userData.selectedDeck);
      // ¡NO AGREGAR MÁS LÓGICA AQUÍ! Esto es solo para login/cambio de usuario.
    }
  }, [userData?.selectedDeck]);

  // Permite actualizar el deck desde el backend (por ejemplo, tras deckSelect)
  // ¡NO USAR PARA SINCRONIZACIÓN AUTOMÁTICA EN CADA RENDER!
  const setDeckFromServer = (deckName: string) => {
    if (deckName && deckName !== selectedDeck) {
      setSelectedDeck(deckName);
    }
  };

  const startReading = async () => {
    if (!connected) {
      toast.error(t('errors.walletNotConnected'));
      return;
    }
    
    if (!intention.trim()) {
      toast.error(t('tarot.intentionRequired'));
      return;
    }
    
    if (isCallingWebhook) {
      console.log('Reading webhook call prevented - already in progress');
      return;
    }
    
    const hasRequiredToken = await checkUserToken();
    if (!hasRequiredToken) {
      toast.error(t('errors.tokenRequired'));
      return;
    }
    
    try {
      console.log('Starting new reading with state:', {
        isCallingWebhook,
        phase,
        connected,
        hasUserData: !!userData,
        timestamp: new Date().toISOString()
      });

      setWebhookError(null);
      setIsCallingWebhook(true);
      setPhase('preparing');
      
      const tempWebhookData = await callReadingWebhook(
        webhooks.reading, 
        userData?.userId, 
        intention,
        environment
      );
      
      if (tempWebhookData) {
        console.log("Setting temporary webhook response:", tempWebhookData);
        setWebhookResponse(tempWebhookData);
      }
      
      if (!tempWebhookData && environment !== 'development') {
        console.log('Reading webhook call failed');
        toast.error(t('errors.serverError'));
        setPhase('intention');
        return;
      }
      
      let selectedDeckFromWebhook: Deck | undefined;
      if (tempWebhookData?.returnwebhoock) {
        try {
          const parsedData = JSON.parse(tempWebhookData.returnwebhoock);
          selectedDeckFromWebhook = parsedData.selected_deck;
          console.log('Parsed deck from webhook:', selectedDeckFromWebhook);
        } catch (error) {
          console.error("Error parsing webhook response for deck:", error);
        }
      }
      
      if (selectedDeckFromWebhook) {
        setSelectedDeck(selectedDeckFromWebhook);
      }
      
      const success = await prepareCardSelection(
        intention,
        selectedDeck,
        tempWebhookData,
        (msg) => setIntroMessage(msg),
        (cards) => setAvailableCards(cards)
      );
      
      if (!success) {
        console.error('Failed to prepare card selection');
        setPhase('intention');
        return;
      }
      
      setPhase('selection');
    } catch (error) {
      console.error('Error in startReading:', error);
      toast.error(t('errors.serverError'));
      setPhase('intention');
    } finally {
      setIsCallingWebhook(false);
    }
  };

  const selectCard = (cardId: string) => {
    if (phase !== 'selection') return;
    
    if (selectedCards.length >= 3) {
      toast.error(t('tarot.maxCardsSelected'));
      return;
    }
    
    const card = availableCards.find(c => c.id === cardId);
    if (!card) return;
    
    const updatedSelectedCards = [
      ...selectedCards, 
      { ...card, revealed: false }
    ];
    
    setSelectedCards(updatedSelectedCards);

    // If we've selected all 3 cards AND we have the final webhook response, transition to reading phase
    if (updatedSelectedCards.length === 3 && webhookResponse && !webhookResponse.isTemporary) {
      console.log("All cards selected and final webhook available, transitioning to reading phase");
      setPhase('reading');
      
      // Now prepare the cards from webhook for reveal phase
      if (webhookResponse.selected_cards && webhookResponse.selected_cards.length > 0 && phase === 'selection') {
        // Usar los índices para seleccionar cartas del deck seleccionado
        const deckCards = tarotCards.filter(c => c.deck === selectedDeck);
        const webhookCards = webhookResponse.selected_cards.map((cardIndex: number) => {
          const card = deckCards[cardIndex] || deckCards[0];
          return {
            ...card,
            revealed: false,
            deck: selectedDeck
          };
        });
        console.log("Setting cards from webhook for reveal phase (by index):", webhookCards);
        setSelectedCards(webhookCards);
      }
    }
  };

  const revealCard = async (index: number) => {
    if (phase !== 'reading') return;
    
    if (isWaitingForWebhook && webhookResponse?.isTemporary) {
      toast.error("Reading data not ready yet. Please wait a moment.");
      return;
    }
    
    const success = await handleCardReveal(
      index,
      selectedCards,
      setSelectedCards,
      webhookResponse,
      intention,
      selectedDeck,
      setFinalMessage
    );
    
    if (success) {
      const card = selectedCards[index];
      if (card) {
        setRevealedCardIds(prev => [...prev, card.id]);
      }

      const updatedCards = [...selectedCards];
      const allRevealed = updatedCards.every(c => c.revealed);
      
      if (allRevealed) {
        toast.success(t('tarot.allCardsRevealed'));
        
        try {
          const interpretationResult = await generateInterpretation(
            updatedCards, 
            intention, 
            webhookResponse
          );
          
          setInterpretation(interpretationResult);
          
          if (!finalMessage) {
            setFinalMessage(interpretationResult.summary);
          }
          
          setPhase('complete');
        } catch (error) {
          console.error("Error generating final interpretation:", error);
          toast.error(t('errors.interpretationFailed'));
        }
      }
    }
  };

  const resetReading = () => {
    resetWebhookState();
    
    setIntention('');
    setPhase('intention');
    setAvailableCards([]);
    setSelectedCards([]);
    setRevealedCardIds([]);
    setIntroMessage(null);
    setFinalMessage(null);
    setInterpretation(null);
    setWebhookResponse(null);
    setWebhookError(null);
    
    // Clear any stored reading data from localStorage
    localStorage.removeItem('currentReading');
    localStorage.removeItem('revealedCards');
    
    toast.success(t('tarot.newReadingStarted'));
  };

  const value = {
    selectedDeck,
    setSelectedDeck,
    intention,
    setIntention,
    phase,
    setPhase,
    availableCards,
    selectedCards,
    setSelectedCards,
    revealedCardIds,
    setRevealedCardIds,
    introMessage,
    finalMessage,
    setFinalMessage,
    startReading,
    selectCard,
    revealCard,
    resetReading,
    loading,
    interpretation,
    webhookResponse,
    webhookError,
    setDeckFromServer,
  };

  return <TarotContext.Provider value={value}>{children}</TarotContext.Provider>;
};

export const useTarot = (): TarotContextType => {
  const context = useContext(TarotContext);
  if (context === undefined) {
    throw new Error('useTarot must be used within a TarotProvider');
  }
  return context;
};
