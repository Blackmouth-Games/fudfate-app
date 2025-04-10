
import { toast } from 'sonner';
import { logLoginWebhook } from '@/services/webhook-service';

/**
 * Connect to Metamask wallet
 */
export const connectMetamask = async (): Promise<{ address: string | null; networkId: string | null; error?: string }> => {
  if (!window.ethereum?.isMetaMask) {
    return { address: null, networkId: null, error: 'Metamask not installed' };
  }
  
  try {
    // Verify first if Metamask is unlocked
    const isUnlocked = await window.ethereum._metamask?.isUnlocked();
    if (!isUnlocked) {
      return { 
        address: null, 
        networkId: null, 
        error: 'Metamask is locked. Please unlock your wallet first.' 
      };
    }
    
    // Always request accounts to ensure user can switch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts && accounts.length > 0) {
      const address = accounts[0];
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const networkId = parseInt(chainIdHex, 16).toString();
      return { address, networkId };
    } else {
      return { address: null, networkId: null, error: 'No accounts returned from Metamask' };
    }
  } catch (error) {
    console.error('Metamask connection error:', error);
    return { 
      address: null, 
      networkId: null, 
      error: `Metamask connection error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Connect to Phantom wallet
 */
export const connectPhantom = async (): Promise<{ address: string | null; networkId: string | null; error?: string }> => {
  if (!window.solana?.isPhantom) {
    return { address: null, networkId: null, error: 'Phantom not installed' };
  }
  
  try {
    // Force reconnect to allow switching accounts
    if (window.solana.isConnected) {
      await window.solana.disconnect();
    }
    
    const response = await window.solana.connect();
    const address = response.publicKey.toString();
    return { address, networkId: 'solana' };
  } catch (error) {
    console.error('Phantom connection error:', error);
    return { 
      address: null, 
      networkId: null, 
      error: `Phantom connection error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Call login webhook
 */
export const callLoginWebhook = async (
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
    
    logLoginWebhook(webhookUrl, { wallet: address, type: walletType }, data, undefined, status, environment);
    
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Parse user data from webhook response
 */
export const parseUserData = (data: any): { userId: string; runsToday: boolean } | null => {
  if (data && Array.isArray(data) && data.length > 0) {
    return {
      userId: data[0].userid,
      runsToday: data[0].runs_today === true,
    };
  }
  return null;
};
