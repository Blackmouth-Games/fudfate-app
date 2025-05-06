export type Deck = 'deck_1' | 'deck_2' | 'deck_3' | string;
export type ReadingPhase = 'intention' | 'preparing' | 'selection' | 'reading' | 'complete';

export interface TarotCard {
  numericId: number;     // 0-21, único por mazo
  id: string;           // Ejemplo: "deck_1_0" (combinación de deck y numericId)
  name: string;         // Nombre display de la carta
  image: string;        // Ruta de la imagen: `/img/cards/${deck}/${numericId}_${name}.jpg`
  description: string;
  deck: string;
}

export interface Card {
  id: string;
  name: string;
  image: string;
  description: string;
  deck?: string;
}

export interface ReadingCard extends Card {
  interpretation?: string;
  revealed: boolean;
  deck?: string;
}

export interface Interpretation {
  summary: string;
  cards?: {
    [key: string]: string;
  };
}

export interface ParsedWebhookData {
  selected_cards?: number[];
  message?: string;
  question?: string | null;
}

export interface WebhookResponse {
  selected_cards?: number[];
  message?: string;
  question?: string | null;
  reading?: any;
  cards?: any;
  returnwebhoock?: any;
  isTemporary?: boolean;
  deck?: string;
}

export interface WebhookArrayResponse extends Array<{
  returnwebhoock?: string;
  message?: string;
  question?: string | null;
  [key: string]: any;
}> {}

export interface TarotContextType {
  selectedDeck: Deck;
  setSelectedDeck: (deck: Deck) => void;
  intention: string;
  setIntention: (intention: string) => void;
  phase: ReadingPhase;
  setPhase: (phase: ReadingPhase) => void;
  availableCards: Card[];
  selectedCards: ReadingCard[];
  setSelectedCards: (cards: ReadingCard[]) => void;
  revealedCardIds: string[];
  setRevealedCardIds: (ids: string[]) => void;
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
  webhookError: string | null;
  readingDeck?: Deck;
}
