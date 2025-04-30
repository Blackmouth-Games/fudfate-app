export interface DownloadHistoryEntry {
  url: string;
  timestamp: number;
  success: boolean;
  error?: string;
  cards?: Array<{
    name: string;
    id: string | number;
    image: string;
  }>;
  intention?: string;
  source: string;
}

export interface HistoryViewingCard {
  name: string;
  id: string | number;
  image: string;
}

declare global {
  interface Window {
    lastWebhookCalls: Record<string, any>;
    imageDownloadHistory: DownloadHistoryEntry[];
    historyViewingCards: HistoryViewingCard[];
  }
} 