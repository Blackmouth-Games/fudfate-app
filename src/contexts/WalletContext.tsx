
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useEnvironment } from '@/hooks/useEnvironment';

// Define types for our wallet providers
export type WalletType = 'phantom' | 'metamask' | null;
export type Network = 'solana' | 'ethereum' | null;

interface UserData {
  userId: string;
  runsToday: boolean;
}

interface UserDataOverride {
  userId?: string;
  runsToday?: boolean;
}

interface WalletContextType {
  connected: boolean;
  walletType: WalletType;
  walletAddress: string | null;
  network: Network;
  userData: UserData | null;
  connectWallet: (type: WalletType) => Promise<boolean>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string | null>;
  overrideUserData: (override: UserDataOverride) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [connected, setConnected] = useState(false);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userDataOverride, setUserDataOverride] = useState<UserDataOverride>({});
  const { webhooks } = useEnvironment();

  useEffect(() => {
    const storedSession = localStorage.getItem('walletSession');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        const expiry = new Date(session.expiry);
        
        if (expiry > new Date() && session.walletType) {
          connectWallet(session.walletType).catch(console.error);
        } else {
          localStorage.removeItem('walletSession');
        }
      } catch (e) {
        console.error("Failed to parse stored session", e);
        localStorage.removeItem('walletSession');
      }
    }
    
    // Check for mock settings
    const mockRunsToday = localStorage.getItem('mockRunsToday');
    if (mockRunsToday) {
      setUserDataOverride(prev => ({
        ...prev,
        runsToday: mockRunsToday === 'true'
      }));
    }
  }, []);

  const isWalletAvailable = (type: WalletType): boolean => {
    if (type === 'phantom') {
      return window.solana && window.solana.isPhantom || false;
    } else if (type === 'metamask') {
      return window.ethereum && window.ethereum.isMetaMask || false;
    }
    return false;
  };

  const callLoginWebhook = async (walletType: WalletType, walletAddress: string): Promise<UserData | null> => {
    try {
      const response = await fetch(webhooks.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toISOString(),
          wallet: walletAddress,
          walletType: walletType
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        userId: data.userid,
        runsToday: data.runs_today === true
      };
    } catch (error) {
      console.error('Error calling login webhook:', error);
      toast.error('Error registering wallet session');
      return null;
    }
  };

  const connectWallet = async (type: WalletType): Promise<boolean> => {
    try {
      if (!isWalletAvailable(type)) {
        const walletName = type === 'phantom' ? 'Phantom' : 'MetaMask';
        toast.error(`${walletName} no está instalado. Por favor instálalo para continuar.`);
        return false;
      }

      let address = '';
      let currentNetwork: Network = null;

      if (type === 'phantom') {
        try {
          const response = await window.solana.connect();
          address = response.publicKey.toString();
          
          currentNetwork = 'solana';
        } catch (error: any) {
          if (error.code === 4001) {
            toast.error("Conexión rechazada por el usuario");
          } else {
            toast.error("Error al conectar con Phantom. Verifica que tengas la wallet abierta.");
            console.error("Phantom error:", error);
          }
          return false;
        }
      } else if (type === 'metamask') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          address = accounts[0];
          currentNetwork = 'ethereum';
        } catch (error: any) {
          if (error.code === 4001) {
            toast.error("Conexión rechazada por el usuario");
          } else {
            toast.error("Error al conectar con MetaMask. Verifica que tengas la wallet abierta.");
            console.error("MetaMask error:", error);
          }
          return false;
        }
      }

      const userDataResponse = await callLoginWebhook(type, address);
      
      const sessionExpiry = new Date();
      sessionExpiry.setMinutes(sessionExpiry.getMinutes() + 30); // 30 minute session
      
      const session = {
        walletType: type,
        walletAddress: address,
        expiry: sessionExpiry.toISOString()
      };
      
      localStorage.setItem('walletSession', JSON.stringify(session));
      
      setConnected(true);
      setWalletType(type);
      setWalletAddress(address);
      setNetwork(currentNetwork);
      
      // Apply any overrides to the user data
      if (userDataResponse) {
        setUserData({
          userId: userDataOverride.userId || userDataResponse.userId,
          runsToday: userDataOverride.runsToday !== undefined ? userDataOverride.runsToday : userDataResponse.runsToday
        });
      }
      
      trackWalletConnection(type, address);
      
      return true;
    } catch (error) {
      console.error(`Error connecting to ${type}:`, error);
      toast.error("Error al conectar wallet. Inténtalo de nuevo.");
      return false;
    }
  };

  const disconnectWallet = () => {
    if (walletType === 'phantom' && window.solana) {
      window.solana.disconnect().catch(console.error);
    }
    
    localStorage.removeItem('walletSession');
    setConnected(false);
    setWalletType(null);
    setWalletAddress(null);
    setNetwork(null);
    setUserData(null);
    
    toast.success("Wallet desconectada correctamente");
  };

  const signMessage = async (message: string): Promise<string | null> => {
    try {
      if (!connected || !walletType) {
        toast.error("Wallet no conectada");
        return null;
      }

      let signature: string | null = null;

      if (walletType === 'phantom') {
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
        signature = Buffer.from(signedMessage.signature).toString('hex');
      } else if (walletType === 'metamask') {
        signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, walletAddress]
        });
      }

      return signature;
    } catch (error) {
      console.error("Error signing message:", error);
      toast.error("Error al firmar mensaje");
      return null;
    }
  };

  // Function to override user data (for dev purposes)
  const overrideUserData = (override: UserDataOverride) => {
    setUserDataOverride(prev => ({
      ...prev,
      ...override
    }));
    
    // If we're already connected, apply the override immediately
    if (connected && userData) {
      setUserData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...(override.userId !== undefined ? { userId: override.userId } : {}),
          ...(override.runsToday !== undefined ? { runsToday: override.runsToday } : {})
        };
      });
    }
  };

  const trackWalletConnection = (type: WalletType, address: string) => {
    console.log(`Tracked connection: ${type}, ${address}`);
    
    const metrics = {
      walletType: type,
      platform: detectPlatform(),
      walletHash: hashAddress(address),
      timestamp: new Date().toISOString(),
      language: navigator.language
    };

    console.log("Connection metrics:", metrics);
  };

  const detectPlatform = (): string => {
    const userAgent = navigator.userAgent;
    if (/Mobi|Android/i.test(userAgent)) return 'mobile';
    return 'desktop';
  };

  const hashAddress = (address: string): string => {
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      const char = address.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  };

  const value = {
    connected,
    walletType,
    walletAddress,
    network,
    userData,
    connectWallet,
    disconnectWallet,
    signMessage,
    overrideUserData
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

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
      connection: any;
    };
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}
