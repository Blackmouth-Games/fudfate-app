
import { useState, useCallback } from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';
import { UserData, WalletType } from '@/types/walletTypes';
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

export const useWalletConnection = (
  walletAddress: string | null,
  walletType: WalletType,
  network: string | null,
  userData: UserData | null,
  setWalletAddress: (address: string | null) => void,
  setWalletType: (type: WalletType) => void,
  setNetwork: (network: string | null) => void,
  setUserData: (data: UserData | null) => void,
  addConnectionLog: (action: string, details: string) => void
) => {
  const { webhooks, environment } = useEnvironment();
  const { saveWalletData, clearWalletData, saveUserData } = useWalletStorage();
  
  const connectWallet = async (type: string): Promise<boolean> => {
    addConnectionLog('Connect Attempt', `Attempting to connect ${type} wallet`);
    
    try {
      if (walletAddress) {
        disconnectWallet();
        addConnectionLog('Reconnect', `Disconnected previous wallet to reconnect with ${type}`);
      }
      
      let connectionResult;
      
      if (type === 'metamask') {
        connectionResult = await connectMetamask();
      } else if (type === 'phantom') {
        connectionResult = await connectPhantom();
      } else {
        addConnectionLog('Connect Failed', `Unknown wallet type: ${type}`);
        toast.error(`Unknown wallet type: ${type}`);
        return false;
      }
      
      if (connectionResult.error) {
        addConnectionLog('Connect Failed', connectionResult.error);
        toast.error(connectionResult.error);
        return false;
      }
      
      const { address, networkId } = connectionResult;
      
      if (!address) {
        addConnectionLog('Connect Failed', `No address returned from ${type}`);
        toast.error(`No address returned from ${type}`);
        return false;
      }

      setWalletAddress(address);
      setWalletType(type as WalletType);
      setNetwork(networkId);
      saveWalletData(address, type, networkId);
      
      addConnectionLog('Connection Success', `Connected to ${type}: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
      
      try {
        const data = await callLoginWebhook(
          webhooks.login, 
          address, 
          type, 
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

      console.log(`Connected with ${type}:`, address);
      
      return true;
    } catch (error) {
      addConnectionLog('Connect Error', `Error: ${error instanceof Error ? error.message : String(error)}`);
      console.error("Error connecting wallet:", error);
      toast.error('Failed to connect wallet. Please try again.');
      return false;
    }
  };
  
  const disconnectWallet = useCallback(() => {
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
    
    // Also clear the session restoration flag
    sessionStorage.removeItem('walletSessionRestored');
    
    console.log("Wallet disconnected");
  }, [walletAddress, walletType, setWalletAddress, setWalletType, setNetwork, setUserData, clearWalletData, addConnectionLog]);
  
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
      // Update to use object parameter format
      logLoginWebhook({
        url: webhookUrl,
        requestData: { wallet: address, type: walletType },
        error: `HTTP error! status: ${status}`,
        status,
        environment
      });
      throw new Error(`HTTP error! status: ${status}`);
    }
    
    const data = await response.json();
    console.log('Login webhook response:', data);
    
    addConnectionLog('Login Success', `Received response with status ${status}`);
    // Update to use object parameter format
    logLoginWebhook({
      url: webhookUrl,
      requestData: { wallet: address, type: walletType },
      responseData: data,
      status,
      environment
    });
    
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    addConnectionLog('Login Error', `Error: ${errorMsg}`);
    throw error;
  }
};
