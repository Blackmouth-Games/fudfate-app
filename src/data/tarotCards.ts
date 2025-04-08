
// Tarot card data with more structured information
export interface TarotCardData {
  imageUrl: string;
  title: string;
  id: string;
  deckId: string;
}

export interface DeckData {
  id: string;
  name: string;
  description: string;
}

// Define the available decks
export const tarotDecks: DeckData[] = [
  {
    id: 'crypto',
    name: 'Crypto Tarot',
    description: 'A tarot deck themed around cryptocurrency concepts and characters'
  }
];

// The cards are now organized by deck
export const tarotCards: TarotCardData[] = [
  {
    id: '0',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_0_TheDegen.png',
    title: 'The Degen',
  },
  {
    id: '1',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_1_TheMiner.png',
    title: 'The Miner',
  },
  {
    id: '2',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_2_TheOracle.png',
    title: 'The Oracle',
  },
  {
    id: '3',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_3_TheWhale.png',
    title: 'The Whale',
  },
  {
    id: '4',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_4_TheExchange.png',
    title: 'The Exchange',
  },
  {
    id: '5',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_5_TheWhitePaper.png',
    title: 'The White Paper',
  },
  {
    id: '6',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_6_TheFork.png',
    title: 'The Fork',
  },
  {
    id: '7',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_7_TheLaunchpad.png',
    title: 'The Launchpad',
  },
  {
    id: '8',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_8_TheSmartContract.png',
    title: 'The Smart Contract',
  },
  {
    id: '9',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_9_ThePrivateKey.png',
    title: 'The Private Key',
  },
  {
    id: '10',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_10_TheAirdrop.png',
    title: 'The Airdrop',
  },
  {
    id: '11',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_11_TheHoldler.png',
    title: 'The Holdler',
  },
  {
    id: '12',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_12_TheStablecoin.png',
    title: 'The Stablecoin',
  },
  {
    id: '13',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_13_TheRugpull.png',
    title: 'The Rugpull',
  },
  {
    id: '14',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_14_TheWallet.png',
    title: 'The Wallet',
  },
  {
    id: '15',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_15_TheFOMO.png',
    title: 'The FOMO',
  },
  {
    id: '16',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_16_TheHacker.png',
    title: 'The Hacker',
  },
  {
    id: '17',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_17_TheNFT.png',
    title: 'The NFT',
  },
  {
    id: '18',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_18_TheMoon.png',
    title: 'The Moon',
  },
  {
    id: '19',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_19_TheMemecoin.png',
    title: 'The Memecoin',
  },
  {
    id: '20',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_20_TheHalving.png',
    title: 'The Halving',
  },
  {
    id: '21',
    deckId: 'crypto',
    imageUrl: '/img/cards/carddeck1/deck1_21_TheDAO.png',
    title: 'The DAO',
  }
];

// Helper function to get cards by deck
export const getCardsByDeck = (deckId: string): TarotCardData[] => {
  return tarotCards.filter(card => card.deckId === deckId);
};

// Helper function to get a deck by ID
export const getDeckById = (deckId: string): DeckData | undefined => {
  return tarotDecks.find(deck => deck.id === deckId);
};
