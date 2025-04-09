
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
          // Instead of auto-connecting, just restore the session data
          // without actually connecting to the wallet
          restoreSession(session);
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
    
    const mockUserId = localStorage.getItem('mockUserId');
    if (mockUserId) {
      setUserDataOverride(prev => ({
        ...prev,
        userId: mockUserId
      }));
    }
  }, []);

  // New function to restore session data without connecting to wallet
  const restoreSession = (session: any) => {
    console.log("Restoring saved wallet session:", session);
    
    // Only set UI state, don't reconnect to the wallet
    setWalletType(session.walletType);
    setWalletAddress(session.walletAddress);
    
    if (session.network) {
      setNetwork(session.network);
    } else {
      setNetwork(session.walletType === 'phantom' ? 'solana' : 'ethereum');
    }
    
    if (session.userData) {
      // Apply any overrides to the restored user data
      const restoredUserData = {
        userId: userDataOverride.userId || session.userData.userId || 'unknown',
        runsToday: userDataOverride.runsToday !== undefined ? 
          userDataOverride.runsToday : 
          (session.userData.runsToday !== undefined ? session.userData.runsToday : true)
      };
      setUserData(restoredUserData);
    }
    
    setConnected(true);
  };

  const isWalletAvailable = (type: WalletType): boolean => {
    if (type === 'phantom') {
      return window.solana && window.solana.isPhantom || false;
    } else if (type === 'metamask') {
      return window.ethereum && window.ethereum.isMetaMask || false;
    }
    return false;
  };

  const isWalletConnected = async (type: WalletType): Promise<boolean> => {
    try {
      if (type === 'phantom') {
        if (!window.solana) return false;
        // Check if already connected to Phantom
        return window.solana.isConnected;
      } else if (type === 'metamask') {
        if (!window.ethereum) return false;
        // Check if already connected to MetaMask
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' // This gets accounts without prompting
        });
        return accounts && accounts.length > 0;
      }
      return false;
    } catch (error) {
      console.error(`Error checking if wallet is connected:`, error);
      return false;
    }
  };

  const callLoginWebhook = async (walletType: WalletType, walletAddress: string): Promise<UserData | null> => {
    try {
      console.log(`Calling login webhook with ${walletType}, ${walletAddress}`);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
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
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Login webhook response:", data);
      
      if (!data) {
        throw new Error('Empty response from login webhook');
      }
      
      if (Array.isArray(data) && data.length > 0) {
        const userInfo = data[0];
        
        if (!userInfo || !userInfo.userid) {
          throw new Error('User ID not found in response');
        }
        
        return {
          userId: userInfo.userid || 'unknown',
          runsToday: userInfo.runs_today === true || userInfo.runs_today === 'true'
        };
      } else if (data.userid) {
        // Handle non-array response format
        return {
          userId: data.userid || 'unknown',
          runsToday: data.runs_today === true || data.runs_today === 'true'
        };
      } else {
        throw new Error('Invalid response format from login webhook');
      }
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
        toast.error(`${walletName} ${t('errors.walletNotInstalled')}`);
        return false;
      }

      // Check if the wallet is already connected in the browser
      const alreadyConnected = await isWalletConnected(type);
      
      if (!alreadyConnected) {
        // If wallet is not connected, prompt user to connect first
        if (type === 'phantom') {
          try {
            if (!window.solana) {
              toast.error(t('errors.phantomNotAvailable'));
              return false;
            }
            await window.solana.connect();
          } catch (error: any) {
            if (error.code === 4001) {
              toast.error(t('errors.connectionRejected'));
            } else {
              toast.error(t('errors.phantomConnectionFailed'));
              console.error("Phantom connection error:", error);
            }
            return false;
          }
        } else if (type === 'metamask') {
          try {
            if (!window.ethereum) {
              toast.error(t('errors.metamaskNotAvailable'));
              return false;
            }
            await window.ethereum.request({ method: 'eth_requestAccounts' });
          } catch (error: any) {
            if (error.code === 4001) {
              toast.error(t('errors.connectionRejected'));
            } else {
              toast.error(t('errors.metamaskConnectionFailed'));
              console.error("MetaMask connection error:", error);
            }
            return false;
          }
        }
      }
      
      // Now get wallet address after successful connection
      let address = '';
      let currentNetwork: Network = null;

      if (type === 'phantom') {
        if (!window.solana || !window.solana.isConnected) {
          toast.error(t('errors.phantomNotConnected'));
          return false;
        }
        address = window.solana.publicKey.toString();
        currentNetwork = 'solana';
      } else if (type === 'metamask') {
        if (!window.ethereum) {
          toast.error(t('errors.metamaskNotConnected'));
          return false;
        }
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (!accounts || accounts.length === 0) {
          toast.error(t('errors.metamaskNoAccounts'));
          return false;
        }
        address = accounts[0];
        currentNetwork = 'ethereum';
      }

      // Call login webhook and get user data
      const userDataResponse = await callLoginWebhook(type, address);
      
      // If the webhook call failed, don't proceed with connection
      if (!userDataResponse) {
        // Reset the connection state to ensure UI shows disconnected
        setConnected(false);
        setWalletType(null);
        setWalletAddress(null);
        setNetwork(null);
        setUserData(null);
        return false;
      }
      
      const sessionExpiry = new Date();
      sessionExpiry.setMinutes(sessionExpiry.getMinutes() + 30); // 30 minute session
      
      // Apply any overrides to the user data
      const finalUserData = {
        userId: userDataOverride.userId || userDataResponse.userId,
        runsToday: userDataOverride.runsToday !== undefined ? 
          userDataOverride.runsToday : userDataResponse.runsToday
      };
      
      const session = {
        walletType: type,
        walletAddress: address,
        network: currentNetwork,
        userData: finalUserData, // Store userData in session for restoration
        expiry: sessionExpiry.toISOString()
      };
      
      localStorage.setItem('walletSession', JSON.stringify(session));
      
      setConnected(true);
      setWalletType(type);
      setWalletAddress(address);
      setNetwork(currentNetwork);
      setUserData(finalUserData);
      
      trackWalletConnection(type, address);
      
      toast.success(t('wallet.connectSuccess'));
      return true;
    } catch (error) {
      console.error(`Error connecting to ${type}:`, error);
      toast.error(t('errors.connectionFailed'));
      
      // Reset the connection state to ensure UI shows disconnected
      setConnected(false);
      setWalletType(null);
      setWalletAddress(null);
      setNetwork(null);
      setUserData(null);
      
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
    
    toast.success(t('wallet.disconnectSuccess'));
  };

  const signMessage = async (message: string): Promise<string | null> => {
    try {
      if (!connected || !walletType) {
        toast.error(t('errors.walletNotConnected'));
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
      toast.error(t('errors.signatureFailed'));
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
    
    // Save to localStorage for persistence
    if (override.userId !== undefined) {
      localStorage.setItem('mockUserId', override.userId);
    }
    if (override.runsToday !== undefined) {
      localStorage.setItem('mockRunsToday', String(override.runsToday));
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

  // Helper function to access translation outside of components
  const t = (key: string): string => {
    // Simple translation function for common terms
    const translations: Record<string, Record<string, string>> = {
      en: {
        'errors.walletNotInstalled': 'wallet is not installed. Please install it to continue.',
        'errors.connectionRejected': 'Connection rejected by user',
        'errors.phantomConnectionFailed': 'Error connecting to Phantom. Verify your wallet is open.',
        'errors.metamaskConnectionFailed': 'Error connecting to MetaMask. Verify your wallet is open.',
        'errors.connectionFailed': 'Error connecting wallet. Please try again.',
        'errors.walletNotConnected': 'Wallet not connected',
        'errors.signatureFailed': 'Error signing message',
        'errors.phantomNotAvailable': 'Phantom wallet is not available',
        'errors.metamaskNotAvailable': 'MetaMask wallet is not available',
        'errors.phantomNotConnected': 'Phantom wallet is not connected',
        'errors.metamaskNotConnected': 'MetaMask wallet is not connected',
        'errors.metamaskNoAccounts': 'No accounts found in MetaMask',
        'wallet.connectSuccess': 'Wallet connected successfully',
        'wallet.disconnectSuccess': 'Wallet disconnected successfully'
      },
      es: {
        'errors.walletNotInstalled': 'no está instalado. Por favor instálalo para continuar.',
        'errors.connectionRejected': 'Conexión rechazada por el usuario',
        'errors.phantomConnectionFailed': 'Error al conectar con Phantom. Verifica que tengas la wallet abierta.',
        'errors.metamaskConnectionFailed': 'Error al conectar con MetaMask. Verifica que tengas la wallet abierta.',
        'errors.connectionFailed': 'Error al conectar wallet. Inténtalo de nuevo.',
        'errors.walletNotConnected': 'Wallet no conectada',
        'errors.signatureFailed': 'Error al firmar mensaje',
        'errors.phantomNotAvailable': 'La wallet Phantom no está disponible',
        'errors.metamaskNotAvailable': 'La wallet MetaMask no está disponible',
        'errors.phantomNotConnected': 'La wallet Phantom no está conectada',
        'errors.metamaskNotConnected': 'La wallet MetaMask no está conectada',
        'errors.metamaskNoAccounts': 'No se encontraron cuentas en MetaMask',
        'wallet.connectSuccess': 'Wallet conectada correctamente',
        'wallet.disconnectSuccess': 'Wallet desconectada correctamente'
      }
    };
    
    const lang = localStorage.getItem('i18nextLng') || 'en';
    return translations[lang as 'en' | 'es']?.[key] || key;
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
      isConnected?: boolean;
      publicKey?: { toString: () => string };
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
