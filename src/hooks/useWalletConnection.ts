
import { useState } from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';
import { logLoginWebhook } from '@/services/webhook-service';
import { UserData } from '@/types/walletTypes';
import { toast } from 'sonner';

export const useWalletConnection = (addConnectionLog: (action: string, details: string) => void) => {
  const { webhooks, environment } = useEnvironment();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const connectWallet = async (walletType: string): Promise<boolean> => {
    addConnectionLog('Connect Attempt', `Attempting to connect ${walletType} wallet`);
    
    try {
      let address: string | null = null;
      let networkId: string | null = null;
      
      // Conexión a Metamask
      if (walletType === 'metamask') {
        if (!window.ethereum?.isMetaMask) {
          toast.error('Metamask not installed or not unlocked');
          addConnectionLog('Connect Failed', 'Metamask not installed');
          return false;
        }
        
        try {
          // Verificar primero si Metamask está desbloqueado
          const isUnlocked = await window.ethereum._metamask?.isUnlocked();
          if (!isUnlocked) {
            toast.error('Metamask is locked. Please unlock your wallet first.', {
              description: "You need to unlock your wallet before connecting."
            });
            addConnectionLog('Connect Failed', 'Metamask is locked');
            return false;
          }
          
          // Intentar obtener cuentas - esto también fallaría si Metamask está bloqueado
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            address = accounts[0];
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            networkId = parseInt(chainIdHex, 16).toString();
          } else {
            addConnectionLog('Connect Failed', 'No accounts returned from Metamask');
            toast.error('No accounts available. Please unlock Metamask');
            return false;
          }
        } catch (error) {
          console.error('Metamask connection error:', error);
          toast.error('Failed to connect with Metamask. Please make sure it is unlocked');
          addConnectionLog('Connect Failed', `Metamask connection error: ${error instanceof Error ? error.message : String(error)}`);
          return false;
        }
      } else if (walletType === 'phantom') {
        if (!window.solana?.isPhantom) {
          toast.error('Phantom not installed or not unlocked');
          addConnectionLog('Connect Failed', 'Phantom not installed');
          return false;
        }
        
        try {
          // Phantom tiene un comportamiento diferente, intenta conectar directamente
          const response = await window.solana.connect();
          address = response.publicKey.toString();
          networkId = 'solana';
        } catch (error) {
          console.error('Phantom connection error:', error);
          toast.error('Failed to connect with Phantom. Please make sure it is unlocked');
          addConnectionLog('Connect Failed', `Phantom connection error: ${error instanceof Error ? error.message : String(error)}`);
          return false;
        }
      }
      
      if (!address) {
        addConnectionLog('Connect Failed', `No address returned from ${walletType}`);
        return false;
      }

      setWalletAddress(address);
      setWalletType(walletType);
      setNetwork(networkId);
      
      localStorage.setItem('walletAddress', address);
      localStorage.setItem('walletType', walletType);
      localStorage.setItem('network', networkId || '');
      
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
