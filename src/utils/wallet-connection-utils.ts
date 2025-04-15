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
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
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
  if (!data) return null;

  // Try to get user ID from the response
  const userId = data.userid || data.userId || null;
  if (!userId) {
    console.error("No user ID found in webhook response");
    return null;
  }

  // Parse whitelist status, defaulting to false if not present
  const isWhitelisted = data.whitelist === true;
  
  // Parse runs availability, defaulting to false if not present
  const runsToday = data.runsToday === true;

  return {
    userId,
    runsToday,
    whitelisted: isWhitelisted
  };
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
    image: deck.image
  }));
};
