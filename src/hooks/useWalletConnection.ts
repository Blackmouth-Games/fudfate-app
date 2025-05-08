import { useCallback } from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';
import { UserData, WalletType } from '@/types/walletTypes';
import { toast } from 'sonner';
import { 
  connectPhantom,
  connectSolflare,
  connectMobileWallet,
  parseUserData,
  fetchAvailableDecks,
  processDecksFromApi
} from '@/utils/wallet-connection-utils';
import { useWalletStorage } from '@/hooks/useWalletStorage';
import { logLoginWebhook } from '@/services/webhook';
import { Environment } from '@/config/webhooks';
import { TOKENS_TO_SHOW } from '@/config/tokensToShow';
import { getTokenBalance } from '@/utils/token-utils';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const useWalletConnection = (
  walletAddress: string | null,
  walletType: WalletType,
  network: string | null,
  userData: UserData | null,
  setWalletAddress: (address: string | null) => void,
  setWalletType: (type: WalletType) => void,
  setNetwork: (network: string | null) => void,
  setUserData: (data: UserData | null) => void,
  addConnectionLog: (type: string, message: string, details?: any) => void
) => {
  const { webhooks, environment } = useEnvironment();
  const { saveWalletData, clearWalletData, saveUserData } = useWalletStorage();
  
  const connectWallet = async (type: string): Promise<boolean> => {
    try {
      addConnectionLog('detect_wallet', `Buscando wallet: ${type}`);
      if (walletAddress) {
        disconnectWallet();
      }
      
      let connectionResult;
      
      if (type === 'phantom') {
        connectionResult = await connectPhantom();
        if (!window.solana || !window.solana.isPhantom) {
          addConnectionLog('wallet_not_found', 'Phantom wallet no detectada en window.solana');
        }
      } else if (type === 'solflare') {
        connectionResult = await connectSolflare();
        if (!window.solflare) {
          addConnectionLog('wallet_not_found', 'Solflare wallet no detectada en window.solflare');
        }
      } else if (type === 'mobile') {
        connectionResult = await connectMobileWallet();
      } else {
        addConnectionLog('wallet_type_unknown', `Tipo de wallet desconocido: ${type}`);
        toast.error(`Unknown wallet type: ${type}`);
        return false;
      }
      
      if (connectionResult.error) {
        addConnectionLog('connect_error', connectionResult.error, connectionResult);
        toast.error(connectionResult.error);
        return false;
      }
      
      const { address, networkId } = connectionResult;
      
      if (!address) {
        addConnectionLog('connect_error', `No address returned from ${type}`);
        toast.error(`No address returned from ${type}`);
        return false;
      }

      addConnectionLog('connect_success', `Conexión exitosa: ${type}`, { address, networkId });
      setWalletAddress(address);
      setWalletType(type as WalletType);
      setNetwork(networkId);
      saveWalletData(address, type, networkId);
      
      try {
        // Obtener balances de los tokens a mostrar
        const tokenBalances: Record<string, string> = {};
        for (const mint of TOKENS_TO_SHOW) {
          tokenBalances[mint] = await getTokenBalance(address, mint) || '0';
        }
        const data = await callLoginWebhook(
          webhooks.login, 
          address, 
          type, 
          environment,
          tokenBalances
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
            addConnectionLog('fetch_decks_error', String(deckError), deckError);
            console.error('Error fetching decks:', deckError);
          }
        } else {
          addConnectionLog('webhook_invalid_response', 'Invalid webhook response format', data);
          console.error("Invalid webhook response format:", data);
          toast.error('Invalid webhook response format');
          return false;
        }
      } catch (error) {
        addConnectionLog('webhook_error', String(error), error);
        console.error("Error calling login webhook:", error);
        
        if (environment === 'development') {
          const mockUserData: UserData = {
            userId: `mock_${uuidv4()}`,
            runsToday: false,
            whitelisted: false
          };
          
          setUserData(mockUserData);
          saveUserData(mockUserData);
          toast.warning('Using mock user data for development', {
            description: 'Login webhook failed, but continuing with mock data'
          });
          addConnectionLog('mock_user_data', 'Using mock user data for development', mockUserData);
          return true;
        }
        
        toast.error('Error connecting to login webhook. Please try again later.');
        disconnectWallet();
        return false;
      }

      return true;
    } catch (error) {
      addConnectionLog('connect_exception', String(error), error);
      console.error("Error connecting wallet:", error);
      toast.error('Failed to connect wallet. Please try again.');
      return false;
    }
  };
  
  const disconnectWallet = useCallback(() => {
    if (walletAddress) {
      addConnectionLog('disconnect', `Wallet desconectada: ${walletType}`);
      if (walletType === 'phantom' && window.solana?.isConnected) {
        try {
          window.solana.disconnect();
        } catch (error) {
          addConnectionLog('disconnect_error', 'Error disconnecting from Phantom', error);
          console.error("Error disconnecting from Phantom:", error);
        }
      } else if (walletType === 'solflare' && window.solflare?.isConnected) {
        try {
          window.solflare.disconnect();
        } catch (error) {
          addConnectionLog('disconnect_error', 'Error disconnecting from Solflare', error);
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
        userId: data.userId || `mock_${uuidv4()}`,
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
  environment: Environment,
  tokenBalances?: Record<string, string>
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
        type: walletType,
        tokenBalances: tokenBalances || {},
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
