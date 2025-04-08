
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useWallet } from './WalletContext';

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

interface TarotContextType {
  selectedDeck: Deck;
  setSelectedDeck: (deck: Deck) => void;
  intention: string;
  setIntention: (intention: string) => void;
  phase: ReadingPhase;
  availableCards: Card[];
  selectedCards: ReadingCard[];
  introMessage: string | null;
  finalMessage: string | null;
  startReading: () => Promise<void>;
  selectCard: (cardId: string) => void;
  revealCard: (index: number) => Promise<void>;
  resetReading: () => void;
  loading: boolean;
}

const TarotContext = createContext<TarotContextType | undefined>(undefined);

export const TarotProvider = ({ children }: { children: ReactNode }) => {
  const { connected, walletAddress, walletType, network } = useWallet();
  
  const [selectedDeck, setSelectedDeck] = useState<Deck>('deck1');
  const [intention, setIntention] = useState<string>('');
  const [phase, setPhase] = useState<ReadingPhase>('intention');
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<ReadingCard[]>([]);
  const [introMessage, setIntroMessage] = useState<string | null>(null);
  const [finalMessage, setFinalMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to shuffle and select random cards
  const getRandomCards = (count: number = 6): Card[] => {
    const deckCards = tarotCards.filter(card => card.deck === selectedDeck);
    const shuffled = [...deckCards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Function to simulate AI interaction for the initial intro message
  const generateIntroMessage = async (userIntention: string): Promise<string> => {
    // In a real app, this would make an API call to your backend
    // which would then call OpenAI or another AI service
    
    // For now, we'll simulate the response
    setLoading(true);
    
    try {
      // Simulating an API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return `Las energías cósmicas se alinean con tu intención: "${userIntention}". Estoy percibiendo vibraciones que guiarán tu lectura. Selecciona tres cartas para revelar los mensajes que el universo tiene para ti.`;
    } catch (error) {
      console.error("Error generating intro message:", error);
      throw new Error("No se pudo generar el mensaje de introducción");
    } finally {
      setLoading(false);
    }
  };

  // Function to simulate AI interpretation for a card
  const generateCardInterpretation = async (cardId: string, userIntention: string): Promise<string> => {
    // In a real app, this would make an API call to your backend
    // which would then call OpenAI or another AI service
    
    setLoading(true);
    
    try {
      // Simulating an API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const card = availableCards.find(c => c.id === cardId);
      if (!card) throw new Error("Card not found");
      
      // Simple simulated response based on the card and intention
      return `Para tu intención "${userIntention}", la carta ${card.name} sugiere que estás en un momento de transformación. Esta energía te invita a confiar en tu intuición y seguir adelante con confianza en el camino que has elegido.`;
    } catch (error) {
      console.error("Error generating card interpretation:", error);
      throw new Error("No se pudo generar la interpretación de la carta");
    } finally {
      setLoading(false);
    }
  };

  // Function to simulate AI final message
  const generateFinalMessage = async (cards: ReadingCard[], userIntention: string): Promise<string> => {
    // In a real app, this would make an API call to your backend
    // which would then call OpenAI or another AI service
    
    setLoading(true);
    
    try {
      // Simulating an API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simple simulated response based on all cards and intention
      return `La combinación de las cartas elegidas revela un patrón interesante para tu intención "${userIntention}". El mensaje general sugiere que estás en un momento de importantes decisiones que determinarán tu futuro cercano. Confía en tu intuición y mantén la mente abierta a nuevas posibilidades.`;
    } catch (error) {
      console.error("Error generating final message:", error);
      throw new Error("No se pudo generar el mensaje final");
    } finally {
      setLoading(false);
    }
  };

  // Start a new reading
  const startReading = async () => {
    if (!connected) {
      toast.error("Debes conectar tu wallet para realizar una lectura");
      return;
    }
    
    if (!intention.trim()) {
      toast.error("Por favor ingresa tu intención o pregunta");
      return;
    }
    
    // Check if user has the required token (for a real app)
    // This would query the blockchain to check token balance
    const hasRequiredToken = await checkUserToken();
    if (!hasRequiredToken) {
      toast.error("Necesitas tener el token requerido en tu wallet para realizar una lectura");
      return;
    }
    
    try {
      setPhase('preparing');
      
      // Generate intro message
      const intro = await generateIntroMessage(intention);
      setIntroMessage(intro);
      
      // Get random cards for selection
      const randomCards = getRandomCards(6);
      setAvailableCards(randomCards);
      
      // Move to selection phase
      setPhase('selection');
    } catch (error) {
      console.error("Error starting reading:", error);
      toast.error("Error al iniciar la lectura. Inténtalo de nuevo.");
      setPhase('intention');
    }
  };

  // Select a card during the selection phase
  const selectCard = (cardId: string) => {
    if (phase !== 'selection') return;
    
    if (selectedCards.length >= 3) {
      toast.error("Ya has seleccionado 3 cartas");
      return;
    }
    
    const card = availableCards.find(c => c.id === cardId);
    if (!card) return;
    
    // Remove card from available cards
    setAvailableCards(prev => prev.filter(c => c.id !== cardId));
    
    // Add card to selected cards
    setSelectedCards(prev => [
      ...prev, 
      { ...card, revealed: false }
    ]);
    
    // If 3 cards are selected, move to reading phase
    if (selectedCards.length === 2) { // We're adding the 3rd card now
      setPhase('reading');
    }
  };

  // Reveal a card during the reading phase
  const revealCard = async (index: number) => {
    if (phase !== 'reading') return;
    
    const card = selectedCards[index];
    if (!card || card.revealed) return;
    
    try {
      // Generate interpretation for this card
      const interpretation = await generateCardInterpretation(card.id, intention);
      
      // Update the card
      const updatedCards = [...selectedCards];
      updatedCards[index] = {
        ...card,
        interpretation,
        revealed: true
      };
      
      setSelectedCards(updatedCards);
      
      // Check if all cards are revealed
      const allRevealed = updatedCards.every(c => c.revealed);
      if (allRevealed) {
        // Generate final message
        const finalMsg = await generateFinalMessage(updatedCards, intention);
        setFinalMessage(finalMsg);
        setPhase('complete');
      }
    } catch (error) {
      console.error("Error revealing card:", error);
      toast.error("Error al revelar la carta. Inténtalo de nuevo.");
    }
  };

  // Reset the reading to start a new one
  const resetReading = () => {
    setIntention('');
    setPhase('intention');
    setAvailableCards([]);
    setSelectedCards([]);
    setIntroMessage(null);
    setFinalMessage(null);
  };
  
  // Mock function to check if user has required token
  // In a real app, this would query the blockchain
  const checkUserToken = async (): Promise<boolean> => {
    try {
      setLoading(true);
      // Simulate checking token balance
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, always return true in our simulation
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
    introMessage,
    finalMessage,
    startReading,
    selectCard,
    revealCard,
    resetReading,
    loading
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
