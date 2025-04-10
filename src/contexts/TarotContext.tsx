
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useWallet } from './WalletContext';
import { useEnvironment } from '@/hooks/useEnvironment';

// Assuming we have the tarot card data files
import tarotCards from '../data/tarotCards';

export type Deck = 'deck1' | 'deck2';
export type ReadingPhase = 'intention' | 'preparing' | 'selection' | 'reading' | 'complete';

interface Card {
  id: string;
  name: string;
  image: string;
  description: string;
}

interface ReadingCard extends Card {
  interpretation?: string;
  revealed: boolean;
}

interface Interpretation {
  summary: string;
  cards?: {
    [key: string]: string;
  };
}

interface WebhookResponse {
  selected_cards?: number[];
  message?: string;
  selected_deck?: Deck;
}

interface TarotContextType {
  selectedDeck: Deck;
  setSelectedDeck: (deck: Deck) => void;
  intention: string;
  setIntention: (intention: string) => void;
  phase: ReadingPhase;
  availableCards: Card[];
  selectedCards: ReadingCard[];
  setSelectedCards: (cards: ReadingCard[]) => void;
  introMessage: string | null;
  finalMessage: string | null;
  setFinalMessage: (message: string | null) => void;
  startReading: () => Promise<void>;
  selectCard: (cardId: string) => void;
  revealCard: (index: number) => Promise<void>;
  resetReading: () => void;
  loading: boolean;
  interpretation: Interpretation | null;
}

const TarotContext = createContext<TarotContextType | undefined>(undefined);

export const TarotProvider = ({ children }: { children: ReactNode }) => {
  const { connected, walletAddress, walletType, network, userData } = useWallet();
  const { webhooks, environment } = useEnvironment();
  
  const [selectedDeck, setSelectedDeck] = useState<Deck>('deck1');
  const [intention, setIntention] = useState<string>('');
  const [phase, setPhase] = useState<ReadingPhase>('intention');
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<ReadingCard[]>([]);
  const [introMessage, setIntroMessage] = useState<string | null>(null);
  const [finalMessage, setFinalMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [webhookResponse, setWebhookResponse] = useState<WebhookResponse | null>(null);

  const getRandomCards = (count: number = 6): Card[] => {
    const deckCards = tarotCards.filter(card => card.deck === selectedDeck);
    const shuffled = [...deckCards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const getCardsByIndices = (indices: number[]): Card[] => {
    const deckCards = tarotCards.filter(card => card.deck === selectedDeck);
    return indices.map(index => {
      // Ensure the index is valid
      const validIndex = Math.min(Math.max(0, index), deckCards.length - 1);
      return deckCards[validIndex];
    });
  };

  const generateIntroMessage = async (userIntention: string): Promise<string> => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return `Las energías cósmicas se alinean con tu intención: "${userIntention}". Estoy percibiendo vibraciones que guiarán tu lectura. Selecciona tres cartas para revelar los mensajes que el universo tiene para ti.`;
    } catch (error) {
      console.error("Error generating intro message:", error);
      throw new Error("No se pudo generar el mensaje de introducción");
    } finally {
      setLoading(false);
    }
  };

  const generateCardInterpretation = async (cardId: string, userIntention: string): Promise<string> => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const card = tarotCards.find(c => c.id === cardId);
      if (!card) throw new Error("Card not found");
      
      return `Para tu intención "${userIntention}", la carta ${card.name} sugiere que estás en un momento de transformación. Esta energía te invita a confiar en tu intuición y seguir adelante con confianza en el camino que has elegido.`;
    } catch (error) {
      console.error("Error generating card interpretation:", error);
      throw new Error("No se pudo generar la interpretación de la carta");
    } finally {
      setLoading(false);
    }
  };

  const generateFinalMessage = async (cards: ReadingCard[], userIntention: string): Promise<string> => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use the webhook response message if available
      const message = webhookResponse?.message || 
        `La combinación de las cartas elegidas revela un patrón interesante para tu intención "${userIntention}". El mensaje general sugiere que estás en un momento de importantes decisiones que determinarán tu futuro cercano. Confía en tu intuición y mantén la mente abierta a nuevas posibilidades.`;
      
      setInterpretation({
        summary: message,
        cards: cards.reduce((acc, card) => {
          if (card.interpretation) {
            acc[card.id] = card.interpretation;
          }
          return acc;
        }, {} as {[key: string]: string})
      });
      
      return message;
    } catch (error) {
      console.error("Error generating final message:", error);
      throw new Error("No se pudo generar el mensaje final");
    } finally {
      setLoading(false);
    }
  };

  const callReadingWebhook = async (): Promise<WebhookResponse | null> => {
    if (!userData?.userId) {
      console.error("No user ID available for webhook call");
      return null;
    }

    try {
      console.log("Calling reading webhook with userid:", userData.userId);
      console.log("Using webhook URL:", webhooks.reading);
      
      const response = await fetch(webhooks.reading, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toISOString(),
          userid: userData.userId,
          intention: intention
        }),
      });
      
      if (!response.ok) {
        console.error(`Webhook error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Reading webhook response:', data);
      return data;
    } catch (error) {
      console.error('Error calling reading webhook:', error);
      
      // In development, we allow continuing without the webhook
      if (environment === 'development') {
        toast.error("Error calling reading webhook. Using fallback data in development mode.", {
          style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
        });
        return null;
      }
      
      // In production, we fail the reading
      throw error;
    }
  };

  const startReading = async () => {
    if (!connected) {
      toast.error("Debes conectar tu wallet para realizar una lectura", {
        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
      });
      return;
    }
    
    if (!intention.trim()) {
      toast.error("Por favor ingresa tu intención o pregunta", {
        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
      });
      return;
    }
    
    const hasRequiredToken = await checkUserToken();
    if (!hasRequiredToken) {
      toast.error("Necesitas tener el token requerido en tu wallet para realizar una lectura", {
        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
      });
      return;
    }
    
    try {
      setPhase('preparing');
      
      // Call the reading webhook
      const webhookData = await callReadingWebhook();
      
      // If we're in production and no webhook data, we can't proceed
      if (!webhookData && environment !== 'development') {
        toast.error("No se pudo obtener información del servidor. Inténtalo más tarde.", {
          style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
        });
        setPhase('intention');
        return;
      }
      
      setWebhookResponse(webhookData);
      
      // If webhook returned a selected deck, use it
      if (webhookData?.selected_deck) {
        setSelectedDeck(webhookData.selected_deck);
      }
      
      const intro = await generateIntroMessage(intention);
      setIntroMessage(intro);
      
      // If webhook returned card indices, use those cards
      let randomCards;
      if (webhookData && Array.isArray(webhookData.selected_cards) && webhookData.selected_cards.length > 0) {
        // We'll use these cards when the user reveals them, but for selection we still show random ones
        randomCards = getRandomCards(6);
      } else {
        randomCards = getRandomCards(6);
      }
      
      setAvailableCards(randomCards);
      setPhase('selection');
      
      toast.success("Lectura iniciada correctamente", {
        style: { backgroundColor: '#F2FCE2', color: '#166534', border: '1px solid #16A34A' }
      });
    } catch (error) {
      console.error("Error starting reading:", error);
      toast.error("Error al iniciar la lectura. Inténtalo de nuevo.", {
        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
      });
      setPhase('intention');
    }
  };

  const selectCard = (cardId: string) => {
    if (phase !== 'selection') return;
    
    if (selectedCards.length >= 3) {
      toast.error("Ya has seleccionado 3 cartas", {
        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
      });
      return;
    }
    
    const card = availableCards.find(c => c.id === cardId);
    if (!card) return;
    
    setAvailableCards(prev => prev.filter(c => c.id !== cardId));
    
    setSelectedCards(prev => [
      ...prev, 
      { ...card, revealed: false }
    ]);
    
    if (selectedCards.length === 2) {
      setTimeout(() => {
        setPhase('reading');
        toast.success("Selección completada. Revela las cartas para ver tu lectura.", {
          style: { backgroundColor: '#F2FCE2', color: '#166534', border: '1px solid #16A34A' }
        });
      }, 500);
    }
  };

  const revealCard = async (index: number) => {
    if (phase !== 'reading') return;
    
    const card = selectedCards[index];
    if (!card || card.revealed) return;
    
    try {
      setLoading(true);
      
      // If we have webhook data with selected cards, and this is the first card reveal,
      // replace the selected cards with the ones from the webhook
      if (webhookResponse && 
          Array.isArray(webhookResponse.selected_cards) && 
          webhookResponse.selected_cards.length > 0 &&
          selectedCards.every(c => !c.revealed)) {
        
        const webhookCards = getCardsByIndices(webhookResponse.selected_cards);
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
          return;
        }
      }
      
      const interpretation = await generateCardInterpretation(card.id, intention);
      
      const updatedCards = [...selectedCards];
      updatedCards[index] = {
        ...card,
        interpretation,
        revealed: true
      };
      
      setSelectedCards(updatedCards);
      setLoading(false);
      
      const allRevealed = updatedCards.every(c => c.revealed);
      if (allRevealed) {
        toast.success("Todas las cartas reveladas. Generando lectura final...", {
          style: { backgroundColor: '#F2FCE2', color: '#166534', border: '1px solid #16A34A' }
        });
        
        const finalMsg = await generateFinalMessage(updatedCards, intention);
        setFinalMessage(finalMsg);
        setPhase('complete');
      }
    } catch (error) {
      console.error("Error revealing card:", error);
      toast.error("Error al revelar la carta. Inténtalo de nuevo.", {
        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
      });
      setLoading(false);
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
    
    toast.success("Nueva lectura iniciada", {
      style: { backgroundColor: '#F2FCE2', color: '#166534', border: '1px solid #16A34A' }
    });
  };

  const checkUserToken = async (): Promise<boolean> => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error("Error checking user token:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    selectedDeck,
    setSelectedDeck,
    intention,
    setIntention,
    phase,
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
    interpretation
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
