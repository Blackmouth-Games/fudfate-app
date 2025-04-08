
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// Define types for our wallet providers
export type WalletType = 'phantom' | 'metamask' | null;
export type Network = 'solana' | 'ethereum' | null;

interface WalletContextType {
  connected: boolean;
  walletType: WalletType;
  walletAddress: string | null;
  network: Network;
  connectWallet: (type: WalletType) => Promise<boolean>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [connected, setConnected] = useState(false);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network>(null);

  // Check for a stored session on component mount
  useEffect(() => {
    const storedSession = localStorage.getItem('walletSession');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        const expiry = new Date(session.expiry);
        
        if (expiry > new Date() && session.walletType) {
          // Session is still valid
          connectWallet(session.walletType).catch(console.error);
        } else {
          // Session expired
          localStorage.removeItem('walletSession');
        }
      } catch (e) {
        console.error("Failed to parse stored session", e);
        localStorage.removeItem('walletSession');
      }
    }
  }, []);

  // Function to detect if a wallet provider is available
  const isWalletAvailable = (type: WalletType): boolean => {
    if (type === 'phantom') {
      return window.solana && window.solana.isPhantom || false;
    } else if (type === 'metamask') {
      return window.ethereum && window.ethereum.isMetaMask || false;
    }
    return false;
  };

  // Connect to wallet
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
        // Connect to Phantom (Solana)
        const response = await window.solana.connect();
        address = response.publicKey.toString();
        
        // Check if connected to Solana
        const solanaConnection = await window.solana.connection;
        if (solanaConnection) {
          currentNetwork = 'solana';
        } else {
          toast.error("Por favor conecta tu wallet a la red Solana");
          await window.solana.disconnect();
          return false;
        }
      } else if (type === 'metamask') {
        // Connect to MetaMask (Ethereum)
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        address = accounts[0];
        currentNetwork = 'ethereum';
        
        // For now, we'll just set it to ethereum, but in a real app
        // you would check the chainId to ensure it's on the correct network
      }

      // Create a session
      const sessionExpiry = new Date();
      sessionExpiry.setMinutes(sessionExpiry.getMinutes() + 30); // 30 minute session
      
      const session = {
        walletType: type,
        walletAddress: address,
        expiry: sessionExpiry.toISOString()
      };
      
      localStorage.setItem('walletSession', JSON.stringify(session));
      
      // Update state
      setConnected(true);
      setWalletType(type);
      setWalletAddress(address);
      setNetwork(currentNetwork);
      
      // Track connection (anonymous)
      trackWalletConnection(type, address);
      
      return true;
    } catch (error) {
      console.error(`Error connecting to ${type}:`, error);
      toast.error("Error al conectar wallet. Inténtalo de nuevo.");
      return false;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    if (walletType === 'phantom' && window.solana) {
      window.solana.disconnect().catch(console.error);
    }
    
    // Clear session and state
    localStorage.removeItem('walletSession');
    setConnected(false);
    setWalletType(null);
    setWalletAddress(null);
    setNetwork(null);
  };

  // Sign a message for authentication
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

  // Track wallet connection (anonymous)
  const trackWalletConnection = (type: WalletType, address: string) => {
    // Here you would normally send this data to your analytics service
    // This is just a placeholder for the functionality
    console.log(`Tracked connection: ${type}, ${address}`);
    
    const metrics = {
      walletType: type,
      platform: detectPlatform(),
      walletHash: hashAddress(address),
      timestamp: new Date().toISOString(),
      language: navigator.language
    };

    // In a real app, you would send this to your analytics service
    console.log("Connection metrics:", metrics);
  };

  // Helper function to detect platform
  const detectPlatform = (): string => {
    const userAgent = navigator.userAgent;
    if (/Mobi|Android/i.test(userAgent)) return 'mobile';
    return 'desktop';
  };

  // Helper function to hash wallet address for anonymous tracking
  const hashAddress = (address: string): string => {
    // This is a simple hash function for demonstration
    // In a real app, you would use a proper hashing algorithm
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      const char = address.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  };

  const value = {
    connected,
    walletType,
    walletAddress,
    network,
    connectWallet,
    disconnectWallet,
    signMessage
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

// Type augmentation for global window object
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
