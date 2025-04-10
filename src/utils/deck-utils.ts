
import { Deck } from '@/types/tarot';

export interface ApiDeckResponse {
  id: string;
  name: string;
  description: string;
  created_at: string;
  url: string;
  is_active: boolean;
}

export interface DeckInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  directory: string;
  backImage: string;
  unlocked?: boolean;
}

/**
 * Get the path to the card back image for a given deck
 */
export const getCardBackPath = (deck: Deck): string => {
  // Make sure we use the correct format: '/img/cards/deck_1/99_BACK.png'
  const deckNumber = deck.replace('deck', '');
  const backPath = `/img/cards/deck_${deckNumber}/99_BACK.png`;
  console.log(`getCardBackPath: ${deck} -> ${backPath}`);
  return backPath;
};

/**
 * Get the path to a specific card image in a deck
 */
export const getCardPath = (deck: Deck, cardId: string): string => {
  // Make sure we use the correct format: '/img/cards/deck_1/0_TheDegen.png'
  const deckNumber = deck.replace('deck', '');
  const path = `/img/cards/deck_${deckNumber}/${cardId}.png`;
  return path;
};

/**
 * Convert API deck format to internal format
 */
export const convertApiDeckToInternal = (apiDeck: ApiDeckResponse): DeckInfo => {
  // Extract the deck number from the name (e.g., "deck_1" → "1")
  const deckNumber = apiDeck.name.replace('deck_', '');
  
  // Format display name to be more user friendly
  const displayName = apiDeck.description || `Deck ${deckNumber}`;
  
  // Format the directory path for card images
  const directory = `/img/cards/deck_${deckNumber}/`;
  
  // Get back image path
  const backImage = `/img/cards/deck_${deckNumber}/99_BACK.png`;
  
  return {
    id: apiDeck.id,
    name: `deck${deckNumber}`,
    displayName,
    description: apiDeck.description,
    isActive: apiDeck.is_active,
    createdAt: apiDeck.created_at,
    directory,
    backImage,
    unlocked: true // Default to unlocked
  };
};

/**
 * Get all deck information for the available decks
 */
export const getAllDecks = (): DeckInfo[] => {
  return [
    {
      id: '1',
      name: 'deck1',
      displayName: 'Crypto Classics',
      description: 'The original crypto-themed tarot deck',
      isActive: true,
      createdAt: new Date().toISOString(),
      directory: '/img/cards/deck_1/',
      backImage: '/img/cards/deck_1/99_BACK.png',
      unlocked: true
    },
    {
      id: '2',
      name: 'deck2',
      displayName: 'Traditional Tarot',
      description: 'Classic tarot images with a modern twist',
      isActive: true, 
      createdAt: new Date().toISOString(),
      directory: '/img/cards/deck_2/',
      backImage: '/img/cards/deck_2/99_BACK.png',
      unlocked: true
    }
  ];
};

/**
 * Get available decks for user selection
 * This is the missing function that was being imported
 */
export const getAvailableDecks = (): DeckInfo[] => {
  // For now, just return all decks but in a real app
  // this might filter based on user permissions/ownership
  return getAllDecks().map(deck => ({
    ...deck,
    unlocked: true
  }));
};

/**
 * Get deck information from deck ID
 */
export const getDeckInfo = (deckId: string): DeckInfo | undefined => {
  const allDecks = getAllDecks();
  return allDecks.find((deck) => deck.id === deckId);
};

/**
 * Debug utility to check image availability
 */
export const checkImageAvailability = (imagePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
};
