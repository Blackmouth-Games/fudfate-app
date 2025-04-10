import { useState } from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';
import { UserData } from '@/types/walletTypes';
import { toast } from 'sonner';
import { 
  connectMetamask, 
  connectPhantom, 
  parseUserData,
  fetchAvailableDecks,
  processDecksFromApi
} from '@/utils/wallet-connection-utils';
import { useWalletStorage } from '@/hooks/useWalletStorage';
import { logLoginWebhook } from '@/services/webhook';

export const useWalletConnection = (addConnectionLog: (action: string, details: string) => void) => {
  const { webhooks, environment } = useEnvironment();
  const { saveWalletData, clearWalletData, saveUserData } = useWalletStorage();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const connectWallet = async (walletType: string): Promise<boolean> => {
    addConnectionLog('Connect Attempt', `Attempting to connect ${walletType} wallet`);
    
    try {
      if (walletAddress) {
        disconnectWallet();
        addConnectionLog('Reconnect', `Disconnected previous wallet to reconnect with ${walletType}`);
      }
      
      let connectionResult;
      
      if (walletType === 'metamask') {
        connectionResult = await connectMetamask();
      } else if (walletType === 'phantom') {
        connectionResult = await connectPhantom();
      } else {
        addConnectionLog('Connect Failed', `Unknown wallet type: ${walletType}`);
        toast.error(`Unknown wallet type: ${walletType}`);
        return false;
      }
      
      if (connectionResult.error) {
        addConnectionLog('Connect Failed', connectionResult.error);
        toast.error(connectionResult.error);
        return false;
      }
      
      const { address, networkId } = connectionResult;
      
      if (!address) {
        addConnectionLog('Connect Failed', `No address returned from ${walletType}`);
        toast.error(`No address returned from ${walletType}`);
        return false;
      }

      setWalletAddress(address);
      setWalletType(walletType);
      setNetwork(networkId);
      saveWalletData(address, walletType, networkId);
      
      addConnectionLog('Connection Success', `Connected to ${walletType}: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
      
      try {
        const data = await callLoginWebhook(
          webhooks.login, 
          address, 
          walletType, 
          environment,
          addConnectionLog
        );
        
        const userDataObj = parseUserData(data);
        
        if (userDataObj) {
          addConnectionLog('Login Success', `User ID: ${userDataObj.userId}`);
          setUserData(userDataObj);
          saveUserData(userDataObj);
          
          addConnectionLog('Decks Fetch', `Fetching available decks for user ${userDataObj.userId}`);
          try {
            const decksData = await fetchAvailableDecks(webhooks.deck, userDataObj.userId, environment);
            
            if (Array.isArray(decksData) && decksData.length > 0) {
              const processedDecks = processDecksFromApi(decksData);
              addConnectionLog('Decks Success', `Fetched ${processedDecks.length} decks`);
              console.log('Available decks:', processedDecks);
            } else {
              addConnectionLog('Decks Info', `No decks returned or empty array`);
            }
          } catch (deckError) {
            addConnectionLog('Decks Error', `Failed to fetch decks: ${deckError instanceof Error ? deckError.message : String(deckError)}`);
            console.error('Error fetching decks:', deckError);
          }
        } else {
          addConnectionLog('Login Error', 'Invalid webhook response format');
          console.error("Invalid webhook response format:", data);
          toast.error('Invalid webhook response format');
          return false;
        }
      } catch (error) {
        addConnectionLog('Login Error', `Webhook error: ${error instanceof Error ? error.message : String(error)}`);
        console.error("Error calling login webhook:", error);
        
        if (environment === 'development') {
          const mockUserData = {
            userId: `mock_${Math.random().toString(16).substring(2, 8)}`,
            runsToday: false
          };
          
          addConnectionLog('Login Mock', `Using mock user data in development: ${mockUserData.userId}`);
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

      console.log(`Connected with ${walletType}:`, address);
      
      return true;
    } catch (error) {
      addConnectionLog('Connect Error', `Error: ${error instanceof Error ? error.message : String(error)}`);
      console.error("Error connecting wallet:", error);
      toast.error('Failed to connect wallet. Please try again.');
      return false;
    }
  };
  
  const disconnectWallet = () => {
    if (walletAddress) {
      addConnectionLog('Disconnect', `Disconnected ${walletType} wallet: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`);
      
      if (walletType === 'phantom' && window.solana?.isConnected) {
        try {
          window.solana.disconnect();
        } catch (error) {
          console.error("Error disconnecting from Phantom:", error);
        }
      }
      
      toast.info(`Disconnected from wallet`);
    }
    
    setWalletAddress(null);
    setWalletType(null);
    setNetwork(null);
    setUserData(null);
    clearWalletData();
    
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
      saveUserData(newUserData);
      return;
    }
    
    const updatedUserData = {
      ...userData,
      ...data
    };
    
    setUserData(updatedUserData);
    saveUserData(updatedUserData);
  };

  return {
    connected: !!walletAddress,
    walletAddress,
    walletType,
    network,
    userData,
    connectWallet,
    disconnectWallet,
    overrideUserData
  };
};

const callLoginWebhook = async (
  webhookUrl: string,
  address: string,
  walletType: string,
  environment: string,
  addConnectionLog: (action: string, details: string) => void
): Promise<any> => {
  addConnectionLog('Login WebhookCall', `Calling login webhook with ${walletType}, ${address}`);
  console.log(`Calling login webhook with ${walletType}, ${address}`);
  
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
      addConnectionLog('Login Error', `HTTP error! status: ${status}, ${errorText}`);
      logLoginWebhook(webhookUrl, { wallet: address, type: walletType }, null, `HTTP error! status: ${status}`, status, environment);
      throw new Error(`HTTP error! status: ${status}`);
    }
    
    const data = await response.json();
    console.log('Login webhook response:', data);
    
    addConnectionLog('Login Success', `Received response with status ${status}`);
    logLoginWebhook(webhookUrl, { wallet: address, type: walletType }, data, undefined, status, environment);
    
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    addConnectionLog('Login Error', `Error: ${errorMsg}`);
    throw error;
  }
};
