
import { Card, Deck } from '@/types/tarot';
import tarotCards from '@/data/tarotCards';
import { toast } from 'sonner';

export const getRandomCards = (selectedDeck: Deck, count: number = 6): Card[] => {
  const deckCards = tarotCards.filter(card => card.deck === selectedDeck);
  const shuffled = [...deckCards].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getCardsByIndices = (selectedDeck: Deck, indices: number[]): Card[] => {
  const deckCards = tarotCards.filter(card => card.deck === selectedDeck);
  return indices.map(index => {
    // Ensure the index is valid
    const validIndex = Math.min(Math.max(0, index), deckCards.length - 1);
    return deckCards[validIndex];
  });
};

export const generateIntroMessage = async (userIntention: string): Promise<string> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return `Las energías cósmicas se alinean con tu intención: "${userIntention}". Estoy percibiendo vibraciones que guiarán tu lectura. Selecciona tres cartas para revelar los mensajes que el universo tiene para ti.`;
  } catch (error) {
    console.error("Error generating intro message:", error);
    throw new Error("No se pudo generar el mensaje de introducción");
  }
};

export const generateCardInterpretation = async (cardId: string, userIntention: string): Promise<string> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const card = tarotCards.find(c => c.id === cardId);
    if (!card) throw new Error("Card not found");
    
    return `Para tu intención "${userIntention}", la carta ${card.name} sugiere que estás en un momento de transformación. Esta energía te invita a confiar en tu intuición y seguir adelante con confianza en el camino que has elegido.`;
  } catch (error) {
    console.error("Error generating card interpretation:", error);
    throw new Error("No se pudo generar la interpretación de la carta");
  }
};

export const generateFinalMessage = async (cards: any[], userIntention: string, webhookMessage?: string): Promise<string> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use the webhook response message if available
    return webhookMessage || 
      `La combinación de las cartas elegidas revela un patrón interesante para tu intención "${userIntention}". El mensaje general sugiere que estás en un momento de importantes decisiones que determinarán tu futuro cercano. Confía en tu intuición y mantén la mente abierta a nuevas posibilidades.`;
    
  } catch (error) {
    console.error("Error generating final message:", error);
    throw new Error("No se pudo generar el mensaje final");
  }
};

export const checkUserToken = async (): Promise<boolean> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } catch (error) {
    console.error("Error checking user token:", error);
    return false;
  }
};
