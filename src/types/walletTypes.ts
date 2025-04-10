
import React from 'react';

export type WalletType = 'metamask' | 'phantom' | null;

export interface UserData {
  userId: string;
  runsToday: boolean;
  selectedDeck?: string; // Add selectedDeck to UserData type
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
  connectionLogs: { timestamp: number; action: string; details: string }[];
  clearLogs: () => void;
}

export interface WalletProviderProps {
  children: React.ReactNode;
}
