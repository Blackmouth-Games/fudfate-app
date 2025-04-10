
import React from 'react';

export type WalletType = 'metamask' | 'phantom' | null;

export interface UserData {
  userId: string;
  runsToday: boolean;
  selectedDeck?: string;
}

export interface ConnectionLog {
  timestamp: string;
  action: string;
  details: string;
}

export interface WalletContextType {
  connected: boolean;
  walletAddress: string | null;
  walletType: WalletType;
  network: string | null;
  userData: UserData | null;
  connectWallet: (walletType: string) => Promise<boolean>;
  disconnectWallet: () => void;
  overrideUserData: (data: Partial<UserData>) => void;
  connectionLogs: ConnectionLog[];
  clearLogs: () => void;
}

export interface WalletProviderProps {
  children: React.ReactNode;
}
