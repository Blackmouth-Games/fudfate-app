import { ethers } from 'ethers';
import { PublicKey } from '@solana/web3.js';
import { UserData, WalletType } from '@/types/walletTypes';
import { toast } from 'sonner';
import { Environment } from '@/config/webhooks';

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

export const connectMetamask = async (): Promise<{ address: string | null; networkId: string | null; error: string | null }> => {
  if (typeof window.ethereum === 'undefined') {
    return { address: null, networkId: null, error: 'MetaMask is not installed.' };
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    // Use BrowserProvider from ethers.js v6
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const networkId = network.chainId.toString();

    return { address, networkId, error: null };
  } catch (error: any) {
    console.error("MetaMask connection error:", error);
    return { address: null, networkId: null, error: error.message || 'Failed to connect to MetaMask.' };
  }
};

export const connectPhantom = async (): Promise<{ address: string | null; networkId: string | null; error: string | null }> => {
  if (typeof window.solana === 'undefined') {
    return { address: null, networkId: null, error: 'Phantom wallet is not installed.' };
  }

  try {
    const resp = await window.solana.connect();
    const address = resp.publicKey.toString();
    // Phantom doesn't directly expose network ID, so we assume mainnet
    const networkId = 'mainnet-beta';

    return { address, networkId, error: null };
  } catch (error: any) {
    console.error("Phantom connection error:", error);
    return { address: null, networkId: null, error: error.message || 'Failed to connect to Phantom.' };
  }
};

export const parseUserData = (data: any): UserData | null => {
  console.log('Raw webhook response:', data);
  
  if (!data) {
    console.error("Webhook response is null or undefined");
    return null;
  }

  // If data is a string, try to parse it as JSON
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (error) {
      console.error("Failed to parse webhook response as JSON:", error);
      return null;
    }
  }

  // If data is an array, take the first item
  if (Array.isArray(data)) {
    console.log('Webhook response is an array, using first item');
    data = data[0];
  }

  // Try to get user ID from the response
  const userId = data.userid || data.userId || data.user_id || null;
  if (!userId) {
    console.error("No user ID found in webhook response. Available fields:", Object.keys(data));
    return null;
  }

  // Parse whitelist status, defaulting to false if not present
  const isWhitelisted = data.whitelist === true || 
                       data.whitelist === 'true' || 
                       data.whitelisted === true || 
                       data.whitelisted === 'true';
  
  // Parse runs availability, defaulting to false if not present
  const runsToday = data.runsToday === true || 
                    data.runs_today === true || 
                    data.runsAvailable === true;

  const selectedDeck = data.selected_deck || 
                      data.selectedDeck || 
                      data.deck;

  const userData = {
    userId,
    runsToday,
    whitelisted: isWhitelisted,
    selectedDeck
  };

  console.log('Parsed user data:', userData);
  console.log('Original data fields:', Object.keys(data));
  return userData;
};

export const fetchAvailableDecks = async (
  webhookUrl: string,
  userId: string,
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
        userid: userId
      }),
    });
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Deck webhook response:', data);
    return data;
  } catch (error) {
    console.error("Error calling deck webhook:", error);
    throw error;
  }
};

export const processDecksFromApi = (decksData: any[]): any[] => {
  return decksData.map(deck => ({
    id: deck.id,
    name: deck.name,
    description: deck.description,
    image: deck.image,
    is_active: deck.is_active || false,
    created_at: deck.created_at || new Date().toISOString()
  }));
};
