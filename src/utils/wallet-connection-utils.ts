import { PublicKey } from '@solana/web3.js';
import { UserData, WalletType } from '@/types/walletTypes';
import { toast } from 'sonner';
import { Environment } from '@/config/webhooks';
import { SolanaMobileWalletAdapter, createDefaultAuthorizationResultCache, AddressSelector, createDefaultAddressSelector } from '@solana-mobile/wallet-adapter-mobile';
import { clusterApiUrl } from '@solana/web3.js';

declare global {
  interface Window {
    solana?: any;
    solflare?: any;
  }
}

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

export const connectSolflare = async (): Promise<{ address: string | null; networkId: string | null; error: string | null }> => {
  // Soporte para Solflare como proveedor dedicado o como parte de window.solana
  const solflareProvider = window.solflare || (window.solana && window.solana.isSolflare ? window.solana : null);

  if (!solflareProvider) {
    return { address: null, networkId: null, error: 'Solflare wallet is not installed or not detected.' };
  }

  try {
    const resp = await solflareProvider.connect();
    console.log('Solflare connect() response:', resp);
    const publicKey = resp?.publicKey || solflareProvider.publicKey;
    if (!publicKey) {
      return { address: null, networkId: null, error: 'Failed to get public key from Solflare. Please approve the connection in your wallet.' };
    }
    const address = publicKey.toString();
    const networkId = 'mainnet-beta';
    return { address, networkId, error: null };
  } catch (error: any) {
    if (error && error.code === 4001) {
      // Código estándar de rechazo de usuario
      return { address: null, networkId: null, error: 'Connection request was rejected in Solflare.' };
    }
    console.error("Solflare connection error:", error);
    return { address: null, networkId: null, error: error?.message || 'Failed to connect to Solflare.' };
  }
};

export const connectMobileWallet = async (): Promise<{ address: string | null; networkId: string | null; error: string | null }> => {
  try {
    const mobileWallet = new SolanaMobileWalletAdapter({
      appIdentity: { name: 'FudFate' },
      authorizationResultCache: createDefaultAuthorizationResultCache(),
      addressSelector: createDefaultAddressSelector(),
      chain: 'mainnet-beta',
      onWalletNotFound: async () => {
        window.open('https://solanamobile.com/wallets', '_blank');
      },
    });
    await mobileWallet.connect();
    const address = mobileWallet.publicKey?.toString() || null;
    const networkId = 'mainnet-beta';
    if (!address) {
      return { address: null, networkId: null, error: 'No address returned from mobile wallet' };
    }
    return { address, networkId, error: null };
  } catch (error: any) {
    return { address: null, networkId: null, error: error?.message || 'Failed to connect to mobile wallet.' };
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
