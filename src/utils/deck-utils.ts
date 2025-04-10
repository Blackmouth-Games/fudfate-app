
/**
 * Utility functions for managing deck paths and card references
 */

/**
 * Get the path to a card back image based on deck ID
 */
export const getCardBackPath = (deckId: string = 'deck1'): string => {
  return `/img/cards/${deckId}/99_back.png`;
};

/**
 * Get the path to a deck back image based on deck ID
 */
export const getDeckBackPath = (deckId: string = 'deck1'): string => {
  return `/img/cards/${deckId}/99_back.png`;
};

/**
 * Get the path to a specific card image
 */
export const getCardImagePath = (deckId: string, cardId: string): string => {
  return `/img/cards/${deckId}/${cardId}.png`;
};

/**
 * Format a card path for the data structure
 */
export const formatCardPath = (deckId: string, cardNumber: number, cardName: string): string => {
  return `/img/cards/${deckId}/${cardNumber}_${cardName}.png`;
};

export interface DeckInfo {
  id: string;
  name: string;
  backImage: string;
  unlocked: boolean;
}

/**
 * Get available decks with their information
 */
export const getAvailableDecks = (): DeckInfo[] => {
  return [
    { id: 'deck1', name: 'Crypto Classics', backImage: getDeckBackPath('deck1'), unlocked: true },
    { id: 'deck2', name: 'DeFi Destinies', backImage: getDeckBackPath('deck2'), unlocked: false },
    { id: 'deck3', name: 'NFT Narratives', backImage: getDeckBackPath('deck3'), unlocked: false },
    { id: 'deck4', name: 'Meme Magic', backImage: getDeckBackPath('deck4'), unlocked: false },
    { id: 'deck5', name: 'Web3 Wonders', backImage: getDeckBackPath('deck5'), unlocked: false }
  ];
};
