import { Interpretation } from './Interpretation';

export interface Card {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface ReadingCard extends Card {
  revealed: boolean;
  interpretation?: Interpretation;
  deck?: string;
} 