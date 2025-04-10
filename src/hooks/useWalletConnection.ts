
import { useState } from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';
import { UserData } from '@/types/walletTypes';
import { toast } from 'sonner';
import { 
  connectMetamask, 
  connectPhantom, 
  callLoginWebhook,
  parseUserData,
  fetchAvailableDecks
} from '@/utils/wallet-connection-utils';
import { useWalletStorage } from '@/hooks/useWalletStorage';

export const useWalletConnection = (addConnectionLog: (action: string, details: string) => void) => {
  const { webhooks, environment } = useEnvironment();
  const { saveWalletData, clearWalletData, saveUserData } = useWalletStorage();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const connectWallet = async (walletType: string): Promise<boolean> => {
    // Add connection log
    addConnectionLog('Connect Attempt', `Attempting to connect ${walletType} wallet`);
    
    try {
      // If a wallet is already connected, disconnect it first
      if (walletAddress) {
        disconnectWallet();
        addConnectionLog('Reconnect', `Disconnected previous wallet to reconnect with ${walletType}`);
      }
      
      let connectionResult;
      
      // Connect to the appropriate wallet type
      if (walletType === 'metamask') {
        connectionResult = await connectMetamask();
      } else if (walletType === 'phantom') {
        connectionResult = await connectPhantom();
      } else {
        addConnectionLog('Connect Failed', `Unknown wallet type: ${walletType}`);
        toast.error(`Unknown wallet type: ${walletType}`);
        return false;
      }
      
      // Handle connection errors
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

      // Set state and save to localStorage
      setWalletAddress(address);
      setWalletType(walletType);
      setNetwork(networkId);
      saveWalletData(address, walletType, networkId);
      
      // Log the connection success
      addConnectionLog('Connection Success', `Connected to ${walletType}: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
      
      // Call login webhook
      try {
        const data = await callLoginWebhook(
          webhooks.login, 
          address, 
          walletType, 
          environment,
          addConnectionLog
        );
        
        // Process user data from webhook response
        const userDataObj = parseUserData(data);
        
        if (userDataObj) {
          addConnectionLog('Login Success', `User ID: ${userDataObj.userId}`);
          setUserData(userDataObj);
          saveUserData(userDataObj);
          
          // Fetch available decks after successful login
          try {
            await fetchAvailableDecks(webhooks.deck, userDataObj.userId, environment);
            addConnectionLog('Decks Fetched', `Successfully fetched available decks`);
          } catch (deckError) {
            addConnectionLog('Decks Error', `Failed to fetch decks: ${deckError instanceof Error ? deckError.message : String(deckError)}`);
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
        toast.error('Error connecting to login webhook. Please try again later.');
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
    // Only log if there's actually a wallet to disconnect
    if (walletAddress) {
      addConnectionLog('Disconnect', `Disconnected ${walletType} wallet: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`);
      
      // If phantom is connected, try to disconnect from it
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
