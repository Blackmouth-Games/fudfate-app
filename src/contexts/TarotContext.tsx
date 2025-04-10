
import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  
  // State variables - default to deck_1 instead of deck1
  const [selectedDeck, setSelectedDeck] = useState<Deck>('deck_1');
  const [intention, setIntention] = useState<string>('');
  const [phase, setPhase] = useState<ReadingPhase>('intention');
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<ReadingCard[]>([]);
  const [introMessage, setIntroMessage] = useState<string | null>(null);
  const [finalMessage, setFinalMessage] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [webhookResponse, setWebhookResponse] = useState<WebhookResponse | null>(null);

  const startReading = async () => {
    if (!connected) {
      toast.error(t('errors.walletNotConnected'), {
        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
      });
      return;
    }
    
    if (!intention.trim()) {
      toast.error(t('tarot.intentionRequired'), {
        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
      });
      return;
    }
    
    const hasRequiredToken = await checkUserToken();
    if (!hasRequiredToken) {
      toast.error(t('errors.tokenRequired'), {
        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
      });
      return;
    }
    
    try {
      setPhase('preparing');
      
      // Call the reading webhook
      const webhookData = await callReadingWebhook(
        webhooks.reading, 
        userData?.userId, 
        intention,
        environment
      );
      
      // If we're in production and no webhook data, we can't proceed
      if (!webhookData && environment !== 'development') {
        toast.error(t('errors.serverError'), {
          style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
        });
        setPhase('intention');
        return;
      }
      
      setWebhookResponse(webhookData);
      console.log("Webhook response set:", webhookData);
      
      // Parse the webhook response if needed to extract deck information
      let selectedDeckFromWebhook: Deck | undefined;
      if (webhookData?.returnwebhoock) {
        try {
          const parsedData = JSON.parse(webhookData.returnwebhoock);
          selectedDeckFromWebhook = parsedData.selected_deck;
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
        webhookData,
        (msg) => setIntroMessage(msg),
        (cards) => setAvailableCards(cards)
      );
      
      if (success) {
        setPhase('selection');
        toast.success(t('tarot.readingStarted'), {
          style: { backgroundColor: '#F2FCE2', color: '#166534', border: '1px solid #16A34A' }
        });
      } else {
        throw new Error("Failed to prepare card selection");
      }
    } catch (error) {
      console.error("Error starting reading:", error);
      toast.error(t('errors.readingFailed'), {
        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
      });
      setPhase('intention');
    }
  };

  const selectCard = (cardId: string) => {
    if (phase !== 'selection') return;
    
    if (selectedCards.length >= 3) {
      toast.error(t('tarot.maxCardsSelected'), {
        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
      });
      return;
    }
    
    const card = availableCards.find(c => c.id === cardId);
    if (!card) return;
    
    setAvailableCards(prev => prev.filter(c => c.id !== cardId));
    
    const updatedSelectedCards = [
      ...selectedCards, 
      { ...card, revealed: false }
    ];
    
    setSelectedCards(updatedSelectedCards);
    
    // Automatically advance to reading phase when 3 cards are selected
    if (updatedSelectedCards.length === 3) {
      setTimeout(() => {
        setPhase('reading');
        toast.success(t('tarot.selectionCompleted'), {
          style: { backgroundColor: '#F2FCE2', color: '#166534', border: '1px solid #16A34A' }
        });
      }, 500);
    }
  };

  const revealCard = async (index: number) => {
    if (phase !== 'reading') return;
    
    const success = await handleCardReveal(
      index,
      selectedCards,
      setSelectedCards,
      webhookResponse,
      intention,
      selectedDeck
    );
    
    if (success) {
      const updatedCards = [...selectedCards];
      const allRevealed = updatedCards.every(c => c.revealed);
      
      if (allRevealed) {
        toast.success(t('tarot.allCardsRevealed'), {
          style: { backgroundColor: '#F2FCE2', color: '#166534', border: '1px solid #16A34A' }
        });
        
        try {
          const interpretationResult = await generateInterpretation(
            updatedCards, 
            intention, 
            webhookResponse
          );
          
          setInterpretation(interpretationResult);
          setFinalMessage(interpretationResult.summary);
          setPhase('complete');
        } catch (error) {
          console.error("Error generating final interpretation:", error);
          toast.error(t('errors.interpretationFailed'), {
            style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
          });
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
    
    toast.success(t('tarot.newReadingStarted'), {
      style: { backgroundColor: '#F2FCE2', color: '#166534', border: '1px solid #16A34A' }
    });
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
