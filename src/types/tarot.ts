
export type Deck = 'deck1' | 'deck2';
export type ReadingPhase = 'intention' | 'preparing' | 'selection' | 'reading' | 'complete';

export interface Card {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface ReadingCard extends Card {
  interpretation?: string;
  revealed: boolean;
}

export interface Interpretation {
  summary: string;
  cards?: {
    [key: string]: string;
  };
}

export interface WebhookResponse {
  selected_cards?: number[];
  message?: string;
  selected_deck?: string;
  returnwebhoock?: string;
}

export interface TarotContextType {
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
  webhookResponse: WebhookResponse | null;
}
