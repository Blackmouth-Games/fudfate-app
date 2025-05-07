import React from 'react';

export type WalletType = 'phantom' | 'solflare' | 'mobile' | null;

export interface UserData {
  userId: string;
  runsToday: boolean;
  whitelisted: boolean;
  selectedDeck?: string;
}

export interface ConnectionLog {
  type: string;
  message: string;
  timestamp: string;
  details?: any;
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
