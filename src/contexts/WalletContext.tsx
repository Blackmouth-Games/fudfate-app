
import React, { createContext, useContext, useState } from 'react';
import { WalletContextType, WalletProviderProps, WalletType } from '@/types/walletTypes';
import { useConnectionLogs } from '@/hooks/useConnectionLogs';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useWalletState } from '@/hooks/useWalletState';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const { connectionLogs, addConnectionLog, clearLogs } = useConnectionLogs();
  
  // Define state variables once
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  
  // Initialize wallet state from localStorage
  useWalletState(
    setWalletAddress, 
    setWalletType, 
    setNetwork, 
    setUserData, 
    addConnectionLog
  );
  
  // Use the same state setters in the wallet connection hook
  const {
    connected,
    connectWallet,
    disconnectWallet,
    overrideUserData
  } = useWalletConnection(
    walletAddress,
    walletType,
    network,
    userData,
    setWalletAddress,
    setWalletType,
    setNetwork,
    setUserData,
    addConnectionLog
  );
  
  const value: WalletContextType = {
    connected,
    walletAddress,
    walletType,
    network,
    userData,
    connectWallet,
    disconnectWallet,
    overrideUserData,
    connectionLogs,
    clearLogs
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
