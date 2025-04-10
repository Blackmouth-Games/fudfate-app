
/**
 * Utility functions for managing deck paths and card references
 */

/**
 * Get the path to a card back image based on deck ID
 */
export const getCardBackPath = (deckId: string = 'deck1'): string => {
  // Format should be 'deck_1' instead of 'deck1' for file paths
  const formattedDeckId = deckId.replace(/deck(\d+)/, 'deck_$1');
  return `/img/cards/${formattedDeckId}/99_back.png`;
};

/**
 * Get the path to a deck back image based on deck ID
 */
export const getDeckBackPath = (deckId: string = 'deck1'): string => {
  // Format should be 'deck_1' instead of 'deck1' for file paths
  const formattedDeckId = deckId.replace(/deck(\d+)/, 'deck_$1');
  return `/img/cards/${formattedDeckId}/99_BACK.png`;
};

/**
 * Get the path to a specific card image
 */
export const getCardImagePath = (deckId: string, cardId: string): string => {
  // Format should be 'deck_1' instead of 'deck1' for file paths
  const formattedDeckId = deckId.replace(/deck(\d+)/, 'deck_$1');
  return `/img/cards/${formattedDeckId}/${cardId}.png`;
};

/**
 * Format a card path for the data structure
 */
export const formatCardPath = (deckId: string, cardNumber: number, cardName: string): string => {
  // Format should be 'deck_1' instead of 'deck1' for file paths
  const formattedDeckId = deckId.replace(/deck(\d+)/, 'deck_$1');
  return `/img/cards/${formattedDeckId}/${cardNumber}_${cardName}.png`;
};

export interface DeckInfo {
  id: string;
  name: string;
  displayName: string;
  backImage: string;
  unlocked: boolean;
  description?: string;
  createdAt?: string;
  url?: string;
  isActive?: boolean;
}

/**
 * Map a deck ID from API to internal deck ID
 */
export const mapDeckIdFromApi = (apiName: string): string => {
  // Convert from 'deck_1' format to internal 'deck1' format
  return apiName.replace(/_/g, '');
};

/**
 * Convert API deck data to our internal format
 */
export const convertApiDeckToInternal = (apiDeck: any): DeckInfo => {
  // Ensure we have all required fields with fallbacks
  const id = apiDeck.id || '1';
  const name = apiDeck.name || 'deck_1';
  const internalId = mapDeckIdFromApi(name);
  
  return {
    id: internalId, 
    name: name,
    displayName: apiDeck.description || getDeckDisplayName(internalId),
    backImage: getDeckBackPath(internalId),
    unlocked: apiDeck.is_active === true,
    description: apiDeck.description || '',
    createdAt: apiDeck.created_at || new Date().toISOString(),
    url: apiDeck.url || '',
    isActive: apiDeck.is_active === true
  };
};

/**
 * Get a user-friendly name for a deck
 */
export const getDeckDisplayName = (deckId: string): string => {
  const displayNames: Record<string, string> = {
    'deck1': 'Crypto Classics',
    'deck2': 'DeFi Destinies',
    'deck3': 'NFT Narratives',
    'deck4': 'Meme Magic',
    'deck5': 'Web3 Wonders'
  };
  
  return displayNames[deckId] || deckId;
};

/**
 * Get available decks with their information
 * This is a fallback in case the webhook fails
 */
export const getAvailableDecks = (): DeckInfo[] => {
  return [
    { 
      id: 'deck1', 
      name: 'deck_1', 
      displayName: 'Crypto Classics', 
      backImage: getDeckBackPath('deck1'), 
      unlocked: true 
    },
    { 
      id: 'deck2', 
      name: 'deck_2', 
      displayName: 'DeFi Destinies', 
      backImage: getDeckBackPath('deck2'), 
      unlocked: false 
    },
    { 
      id: 'deck3', 
      name: 'deck_3', 
      displayName: 'NFT Narratives', 
      backImage: getDeckBackPath('deck3'), 
      unlocked: false 
    },
    { 
      id: 'deck4', 
      name: 'deck_4', 
      displayName: 'Meme Magic', 
      backImage: getDeckBackPath('deck4'), 
      unlocked: false 
    },
    { 
      id: 'deck5', 
      name: 'deck_5', 
      displayName: 'Web3 Wonders', 
      backImage: getDeckBackPath('deck5'), 
      unlocked: false 
    }
  ];
};
