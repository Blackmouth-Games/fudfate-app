
import { useState } from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';
import { UserData } from '@/types/walletTypes';
import { toast } from 'sonner';
import { 
  connectMetamask, 
  connectPhantom, 
  callLoginWebhook,
  parseUserData
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
        return false;
      }

      // Set state and save to localStorage
      setWalletAddress(address);
      setWalletType(walletType);
      setNetwork(networkId);
      saveWalletData(address, walletType, networkId);
      
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
        } else {
          addConnectionLog('Login Error', 'Invalid webhook response format');
          console.error("Invalid webhook response format:", data);
          toast.error('Invalid webhook response format', {
            position: 'bottom-center',
          });
          return false;
        }
      } catch (error) {
        addConnectionLog('Login Error', `Webhook error: ${error instanceof Error ? error.message : String(error)}`);
        console.error("Error calling login webhook:", error);
        toast.error('Error connecting to login webhook. Please try again later.', {
          position: 'bottom-center',
        });
        return false;
      }

      addConnectionLog('Connection Success', `Connected with ${walletType}, ${address}`);
      console.log(`Connected with ${walletType}:`, address);
      
      return true;
    } catch (error) {
      addConnectionLog('Connect Error', `Error: ${error instanceof Error ? error.message : String(error)}`);
      console.error("Error connecting wallet:", error);
      toast.error('Failed to connect wallet. Please try again.', {
        position: 'bottom-center',
      });
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
