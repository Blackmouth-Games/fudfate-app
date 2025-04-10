// Token utilities for handling balances and token info

// Mapping of token mint addresses to token info
export interface TokenInfo {
  symbol: string;
  decimals: number;
  name: string;
  icon?: string;
}

// This could be expanded with more tokens in the future
export const TOKEN_LIST: Record<string, TokenInfo> = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    decimals: 9,
    name: 'Solana',
    icon: '/img/icons/solana-logo.svg'
  },
  // Add more tokens as needed
};

/**
 * Get the balance of SOL for a given wallet address
 * Uses the Solana blockchain API with proper error handling
 */
export const getSolanaBalance = async (walletAddress: string): Promise<string> => {
  try {
    // Try to use the public Solana API to get the balance
    const response = await fetch(`https://api.mainnet-beta.solana.com`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [walletAddress]
      }),
    });

    // Check for non-OK responses
    if (!response.ok) {
      // If we get a 403 or other error, return 0 instead of mock value
      console.warn(`Error accessing Solana API: ${response.status} ${response.statusText}`);
      return '0.0000'; // Return 0 balance when API access fails
    }

    const data = await response.json();
    
    // Handle API errors
    if (data.error) {
      console.error('Error getting SOL balance:', data.error);
      return '0.0000'; // Return 0 balance for API errors
    }

    // The balance is returned in lamports (1 SOL = 1,000,000,000 lamports)
    const lamports = data.result?.value || 0;
    const solBalance = (lamports / 1000000000).toFixed(4);
    
    return solBalance;
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    // Return 0 instead of a mock balance
    return '0.0000';
  }
};

/**
 * Get a specific token's balance by mint address
 */
export const getTokenBalance = async (
  walletAddress: string, 
  mintAddress: string
): Promise<string | null> => {
  if (mintAddress === 'So11111111111111111111111111111111111111112') {
    return await getSolanaBalance(walletAddress);
  }
  
  // Here you would implement the logic to get the balance of other tokens
  // Using SPL Token Program for Solana tokens
  return '0.0000'; // Default to 0 for other tokens
};

/**
 * Get info about a token by its mint address
 */
export const getTokenInfo = (mintAddress: string): TokenInfo | null => {
  return TOKEN_LIST[mintAddress] || null;
};

/**
 * Show only the tokens that are desired by the user
 * @param visibleTokens List of token mint addresses to display
 */
export const getVisibleTokens = (visibleTokens: string[] = ['So11111111111111111111111111111111111111112']): TokenInfo[] => {
  return visibleTokens
    .map(mintAddress => TOKEN_LIST[mintAddress])
    .filter((token): token is TokenInfo => token !== undefined);
};
