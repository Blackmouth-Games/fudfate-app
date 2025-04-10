import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type WalletType = 'metamask' | 'phantom' | null;

import { useEnvironment } from '@/hooks/useEnvironment';
import { logLoginWebhook } from '@/services/webhook-service';

interface UserData {
  userId: string;
  runsToday: boolean;
  [key: string]: any;
}

interface ConnectionLog {
  timestamp: string;
  action: string;
  details: string;
}

interface WalletContextType {
  connected: boolean;
  walletAddress: string | null;
  walletType: string | null;
  network: string | null;
  userData: UserData | null;
  connectWallet: (walletType: string) => Promise<boolean>;
  disconnectWallet: () => void;
  overrideUserData: (data: Partial<UserData>) => void;
  connectionLogs: ConnectionLog[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { webhooks, environment } = useEnvironment();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([]);
  
  const addConnectionLog = (action: string, details: string) => {
    setConnectionLogs(prev => {
      const newLogs = [
        {
          timestamp: new Date().toISOString(),
          action,
          details
        },
        ...prev
      ];
      
      return newLogs.slice(0, 50);
    });
  };

  useEffect(() => {
    const savedWalletAddress = localStorage.getItem('walletAddress');
    const savedWalletType = localStorage.getItem('walletType');
    const savedNetwork = localStorage.getItem('network');
    const savedUserData = localStorage.getItem('userData');
    
    if (savedWalletAddress && savedWalletType) {
      setWalletAddress(savedWalletAddress);
      setWalletType(savedWalletType);
      setNetwork(savedNetwork);
      
      if (savedUserData) {
        try {
          setUserData(JSON.parse(savedUserData));
        } catch (error) {
          console.error("Error parsing saved user data:", error);
        }
      }
      
      addConnectionLog('Restore Session', `Restored wallet session: ${savedWalletType}, ${savedWalletAddress}`);
    }
  }, []);

  const connectWallet = async (walletType: string): Promise<boolean> => {
    addConnectionLog('Connect Attempt', `Attempting to connect ${walletType} wallet`);
    
    try {
      const address = `0x${Math.random().toString(16).substring(2, 14)}`;
      const networkId = 'mainnet';
      
      if (!address) {
        addConnectionLog('Connect Failed', `No address returned from ${walletType}`);
        return false;
      }

      setWalletAddress(address);
      setWalletType(walletType);
      setNetwork(networkId);
      
      localStorage.setItem('walletAddress', address);
      localStorage.setItem('walletType', walletType);
      localStorage.setItem('network', networkId);
      
      addConnectionLog('Login WebhookCall', `Calling login webhook with ${walletType}, ${address}`);
      console.log(`Calling login webhook with ${walletType}, ${address}`);
      
      try {
        const response = await fetch(webhooks.login, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: new Date().toISOString(),
            wallet: address,
            type: walletType
          }),
        });
        
        const status = response.status;
        
        if (!response.ok) {
          const errorText = await response.text();
          addConnectionLog('Login Error', `HTTP error! status: ${status}, ${errorText}`);
          logLoginWebhook(webhooks.login, { wallet: address, type: walletType }, null, `HTTP error! status: ${status}`, status, environment);
          throw new Error(`HTTP error! status: ${status}`);
        }
        
        const data = await response.json();
        console.log('Login webhook response:', data);
        
        logLoginWebhook(webhooks.login, { wallet: address, type: walletType }, data, undefined, status, environment);
        
        if (data && Array.isArray(data) && data.length > 0) {
          addConnectionLog('Login Success', `User ID: ${data[0].userid}`);
          
          const userDataObj: UserData = {
            userId: data[0].userid,
            runsToday: data[0].runs_today === true,
          };
          
          setUserData(userDataObj);
          localStorage.setItem('userData', JSON.stringify(userDataObj));
        } else {
          addConnectionLog('Login Error', 'Invalid webhook response format');
          console.error("Invalid webhook response format:", data);
          
          if (environment === 'development') {
            const mockUserData: UserData = {
              userId: `mock_${Math.random().toString(16).substring(2, 10)}`,
              runsToday: true
            };
            
            setUserData(mockUserData);
            localStorage.setItem('userData', JSON.stringify(mockUserData));
            addConnectionLog('Mock Data', `Created mock user data: ${JSON.stringify(mockUserData)}`);
          }
        }
      } catch (error) {
        addConnectionLog('Login Error', `Webhook error: ${error instanceof Error ? error.message : String(error)}`);
        console.error("Error calling login webhook:", error);
        
        if (environment === 'development') {
          const mockUserData: UserData = {
            userId: `mock_${Math.random().toString(16).substring(2, 10)}`,
            runsToday: true
          };
          
          setUserData(mockUserData);
          localStorage.setItem('userData', JSON.stringify(mockUserData));
          addConnectionLog('Mock Data', `Created mock user data: ${JSON.stringify(mockUserData)}`);
        }
      }

      addConnectionLog('Connection Success', `Connected with ${walletType}, ${address}`);
      console.log(`Connected with ${walletType}:`, address);
      
      return true;
    } catch (error) {
      addConnectionLog('Connect Error', `Error: ${error instanceof Error ? error.message : String(error)}`);
      console.error("Error connecting wallet:", error);
      return false;
    }
  };
  
  const disconnectWallet = () => {
    if (walletAddress) {
      addConnectionLog('Disconnect', `Disconnected ${walletType} wallet: ${walletAddress}`);
    }
    
    setWalletAddress(null);
    setWalletType(null);
    setNetwork(null);
    setUserData(null);
    
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
    localStorage.removeItem('network');
    localStorage.removeItem('userData');
    
    console.log("Wallet disconnected");
  };
  
  const overrideUserData = (data: Partial<UserData>) => {
    addConnectionLog('Override UserData', `Updated user data: ${JSON.stringify(data)}`);
    
    if (!userData) {
      const newUserData = {
        userId: data.userId || `mock_${Math.random().toString(16).substring(2, 10)}`,
        runsToday: data.runsToday !== undefined ? data.runsToday : false,
        ...data
      };
      
      setUserData(newUserData);
      localStorage.setItem('userData', JSON.stringify(newUserData));
      return;
    }
    
    const updatedUserData = {
      ...userData,
      ...data
    };
    
    setUserData(updatedUserData);
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
  };
  
  const value = {
    connected: !!walletAddress,
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
