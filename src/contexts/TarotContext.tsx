
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
import { callReadingWebhook } from '@/services/webhook-service';
import { getRandomCards, checkUserToken } from '@/services/tarot-service';
import { useTarotOperations } from '@/hooks/useTarotOperations';

const TarotContext = createContext<TarotContextType | undefined>(undefined);

export const TarotProvider = ({ children }: { children: ReactNode }) => {
  const { connected, walletAddress, walletType, network, userData } = useWallet();
  const { webhooks, environment } = useEnvironment();
  const { t } = useTranslation();
  const { loading, prepareCardSelection, handleCardReveal, generateInterpretation } = useTarotOperations();
  
  // State variables
  const [selectedDeck, setSelectedDeck] = useState<Deck>('deck_1');
  const [intention, setIntention] = useState<string>('');
  const [phase, setPhase] = useState<ReadingPhase>('intention');
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<ReadingCard[]>([]);
  const [introMessage, setIntroMessage] = useState<string | null>(null);
  const [finalMessage, setFinalMessage] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [webhookResponse, setWebhookResponse] = useState<WebhookResponse | null>(null);
  const [isCallingWebhook, setIsCallingWebhook] = useState(false);

  // Listen for readingReady events to update the webhook response
  useEffect(() => {
    const handleReadingReady = (event: CustomEvent) => {
      const readingData = event.detail;
      if (readingData && !readingData.isTemporary) {
        console.log("Reading ready event received:", readingData);
        setWebhookResponse(readingData);
      }
    };

    window.addEventListener('readingReady', handleReadingReady as EventListener);
    
    return () => {
      window.removeEventListener('readingReady', handleReadingReady as EventListener);
    };
  }, []);

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

      setIsCallingWebhook(true);
      setPhase('preparing');
      
      // Call the reading webhook
      const tempWebhookData = await callReadingWebhook(
        webhooks.reading, 
        userData?.userId, 
        intention,
        environment
      );
      
      // Set the temporary webhook response first
      if (tempWebhookData) {
        console.log("Setting temporary webhook response:", tempWebhookData);
        setWebhookResponse(tempWebhookData);
      }
      
      // If webhook call failed completely
      if (!tempWebhookData && environment !== 'development') {
        console.log('Reading webhook call failed');
        toast.error(t('errors.serverError'));
        setPhase('intention');
        return;
      }
      
      // Parse the webhook response if needed to extract deck information
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
      
      // If webhook returned a selected deck, use it
      if (selectedDeckFromWebhook) {
        setSelectedDeck(selectedDeckFromWebhook);
      }
      
      // Prepare cards for selection
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
    
    // We no longer filter the availableCards - the CardSelectionDeck component
    // will handle rendering only unselected cards
    
    const updatedSelectedCards = [
      ...selectedCards, 
      { ...card, revealed: false }
    ];
    
    setSelectedCards(updatedSelectedCards);
  };

  const revealCard = async (index: number) => {
    if (phase !== 'reading') return;
    
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
          
          // If finalMessage hasn't been set yet by handleCardReveal,
          // set it from the interpretation summary
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
    setIntention('');
    setPhase('intention');
    setAvailableCards([]);
    setSelectedCards([]);
    setIntroMessage(null);
    setFinalMessage(null);
    setInterpretation(null);
    setWebhookResponse(null);
    
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
    introMessage,
    finalMessage,
    setFinalMessage,
    startReading,
    selectCard,
    revealCard,
    resetReading,
    loading,
    interpretation,
    webhookResponse
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
