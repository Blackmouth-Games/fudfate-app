
import { toast } from 'sonner';
import { logLoginWebhook } from '@/services/webhook-service';
import { UserData } from '@/types/walletTypes';

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
    // Always force reconnect to allow switching accounts and prevent auto-connect
    if (window.solana.isConnected) {
      await window.solana.disconnect();
      // Add a small delay to ensure disconnection completes
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Explicitly request connection - Fix: Remove the argument from connect()
    const response = await window.solana.connect();
    const address = response.publicKey.toString();
    
    console.log("Connected to Phantom wallet:", address);
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

/**
 * Parse user data from login webhook response
 */
export const parseUserData = (response: any): UserData | null => {
  try {
    if (Array.isArray(response) && response.length > 0) {
      const firstItem = response[0];
      
      // Extract selected_deck if available
      const selectedDeck = firstItem.selected_deck || "deck_1"; // Default to deck_1 if not provided
      
      return {
        userId: firstItem.userid,
        runsToday: firstItem.runs_today || false,
        selectedDeck: selectedDeck // Store the selected deck in user data
      };
    }
    
    if (response && response.userid) {
      // Extract selected_deck if available
      const selectedDeck = response.selected_deck || "deck_1"; // Default to deck_1 if not provided
      
      return {
        userId: response.userid,
        runsToday: response.runs_today || false,
        selectedDeck: selectedDeck  // Store the selected deck in user data
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

/**
 * Call deck webhook to fetch available decks
 */
export const fetchAvailableDecks = async (
  webhookUrl: string,
  userId: string,
  environment: string
): Promise<any[]> => {
  try {
    console.log(`Calling deck webhook for user: ${userId}`);
    console.log(`Using webhook URL: ${webhookUrl}`);
    
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
    
    // Log the full response for debugging
    const status = response.status;
    console.log(`Deck webhook response status: ${status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Deck webhook error: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Deck webhook response data:', data);
    
    // Ensure we have an array, even if empty
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching decks:", error);
    // Log full error with stack trace if available
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return [];
  }
};

/**
 * Process decks from API response
 */
export const processDecksFromApi = (decksData: any[]): any[] => {
  if (!Array.isArray(decksData) || decksData.length === 0) {
    console.log("No decks data to process or invalid format");
    return [];
  }

  console.log("Processing decks data:", decksData);

  // Map API response to expected format
  return decksData.map(deck => ({
    id: deck.id,
    name: deck.name,
    description: deck.description || '',
    created_at: deck.created_at,
    url: deck.url || '',
    is_active: deck.is_active === true
  }));
};
