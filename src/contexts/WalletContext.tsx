
import React, { createContext, useContext, useState } from 'react';
import { WalletContextType, WalletProviderProps } from '@/types/walletTypes';
import { useConnectionLogs } from '@/hooks/useConnectionLogs';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useWalletState } from '@/hooks/useWalletState';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const { connectionLogs, addConnectionLog } = useConnectionLogs();
  const {
    connected,
    walletAddress,
    walletType,
    network,
    userData,
    connectWallet,
    disconnectWallet,
    overrideUserData
  } = useWalletConnection(addConnectionLog);
  
  // Get the state-setting functions for useWalletState
  const [, setWalletAddress] = useState<string | null>(null);
  const [, setWalletType] = useState<string | null>(null);
  const [, setNetwork] = useState<string | null>(null);
  const [, setUserData] = useState(null);
  
  // Initialize wallet state from localStorage
  useWalletState(
    setWalletAddress, 
    setWalletType, 
    setNetwork, 
    setUserData, 
    addConnectionLog
  );
  
  const value = {
    connected,
    walletAddress,
    walletType,
    network,
    userData,
    connectWallet,
    disconnectWallet,
    overrideUserData,
    connectionLogs
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export type { WalletType } from '@/types/walletTypes';
