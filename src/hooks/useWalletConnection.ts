import { useCallback } from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';
import { UserData, WalletType } from '@/types/walletTypes';
import { toast } from 'sonner';
import { 
  connectPhantom,
  connectSolflare,
  parseUserData,
  fetchAvailableDecks,
  processDecksFromApi
} from '@/utils/wallet-connection-utils';
import { useWalletStorage } from '@/hooks/useWalletStorage';
import { logLoginWebhook } from '@/services/webhook';
import { Environment } from '@/config/webhooks';

export const useWalletConnection = (
  walletAddress: string | null,
  walletType: WalletType,
  network: string | null,
  userData: UserData | null,
  setWalletAddress: (address: string | null) => void,
  setWalletType: (type: WalletType) => void,
  setNetwork: (network: string | null) => void,
  setUserData: (data: UserData | null) => void
) => {
  const { webhooks, environment } = useEnvironment();
  const { saveWalletData, clearWalletData, saveUserData } = useWalletStorage();
  
  const connectWallet = async (type: string): Promise<boolean> => {
    try {
      if (walletAddress) {
        disconnectWallet();
      }
      
      let connectionResult;
      
      if (type === 'phantom') {
        connectionResult = await connectPhantom();
      } else if (type === 'solflare') {
        connectionResult = await connectSolflare();
      } else {
        toast.error(`Unknown wallet type: ${type}`);
        return false;
      }
      
      if (connectionResult.error) {
        toast.error(connectionResult.error);
        return false;
      }
      
      const { address, networkId } = connectionResult;
      
      if (!address) {
        toast.error(`No address returned from ${type}`);
        return false;
      }

      setWalletAddress(address);
      setWalletType(type as WalletType);
      setNetwork(networkId);
      saveWalletData(address, type, networkId);
      
      try {
        const data = await callLoginWebhook(
          webhooks.login, 
          address, 
          type, 
          environment
        );
        
        const userDataObj = parseUserData(data);
        
        if (userDataObj) {
          setUserData(userDataObj);
          saveUserData(userDataObj);
          
          try {
            const decksData = await fetchAvailableDecks(webhooks.deck, userDataObj.userId, environment);
            
            if (Array.isArray(decksData) && decksData.length > 0) {
              processDecksFromApi(decksData);
            }
          } catch (deckError) {
            console.error('Error fetching decks:', deckError);
          }
        } else {
          console.error("Invalid webhook response format:", data);
          toast.error('Invalid webhook response format');
          return false;
        }
      } catch (error) {
        console.error("Error calling login webhook:", error);
        
        if (environment === 'development') {
          const mockUserData: UserData = {
            userId: `mock_${Math.random().toString(16).substring(2, 8)}`,
            runsToday: false,
            whitelisted: false
          };
          
          setUserData(mockUserData);
          saveUserData(mockUserData);
          
          toast.warning('Using mock user data for development', {
            description: 'Login webhook failed, but continuing with mock data'
          });
          
          return true;
        }
        
        toast.error('Error connecting to login webhook. Please try again later.');
        disconnectWallet();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error('Failed to connect wallet. Please try again.');
      return false;
    }
  };
  
  const disconnectWallet = useCallback(() => {
    if (walletAddress) {
      if (walletType === 'phantom' && window.solana?.isConnected) {
        try {
          window.solana.disconnect();
        } catch (error) {
          console.error("Error disconnecting from Phantom:", error);
        }
      } else if (walletType === 'solflare' && window.solflare?.isConnected) {
        try {
          window.solflare.disconnect();
        } catch (error) {
          console.error("Error disconnecting from Solflare:", error);
        }
      }
      
      toast.info(`Disconnected from wallet`);
    }
    
    setWalletAddress(null);
    setWalletType(null);
    setNetwork(null);
    setUserData(null);
    clearWalletData();
    
    sessionStorage.removeItem('walletSessionRestored');
  }, [walletAddress, walletType, setWalletAddress, setWalletType, setNetwork, setUserData, clearWalletData]);
  
  const overrideUserData = (data: Partial<UserData>) => {
    if (!userData) {
      const newUserData: UserData = {
        userId: data.userId || `mock_${Math.random().toString(16).substring(2, 8)}`,
        runsToday: data.runsToday !== undefined ? data.runsToday : false,
        whitelisted: data.whitelisted !== undefined ? data.whitelisted : false,
        ...(data.selectedDeck ? { selectedDeck: data.selectedDeck } : {})
      };
      
      setUserData(newUserData);
      saveUserData(newUserData);
      return;
    }
    
    const updatedUserData: UserData = {
      ...userData,
      ...data,
      whitelisted: data.whitelisted !== undefined ? data.whitelisted : userData.whitelisted
    };
    
    setUserData(updatedUserData);
    saveUserData(updatedUserData);
  };

  return {
    connected: !!walletAddress,
    connectWallet,
    disconnectWallet,
    overrideUserData
  };
};

const callLoginWebhook = async (
  webhookUrl: string,
  address: string,
  walletType: string,
  environment: Environment
): Promise<any> => {
  try {
    const response = await fetch(webhookUrl, {
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
      logLoginWebhook(
        {
          url: webhookUrl,
          data: { wallet: address, type: walletType },
          environment
        },
        {
          data: null,
          status
        },
        new Error(`HTTP error! status: ${status}`)
      );
      throw new Error(`HTTP error! status: ${status}`);
    }
    
    const data = await response.json();
    
    logLoginWebhook(
      {
        url: webhookUrl,
        data: { wallet: address, type: walletType },
        environment
      },
      {
        data,
        status
      }
    );
    
    return data;
  } catch (error) {
    throw error;
  }
};
