
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
 * In a real app, this would connect to the Solana blockchain
 */
export const getSolanaBalance = async (walletAddress: string): Promise<string> => {
  // In a real implementation, this would use web3.js to fetch the actual balance
  // For now, we'll simulate a realistic balance
  
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  
  // Generate a realistic SOL balance (between 0.1 and 10 SOL)
  const balance = (Math.random() * 9.9 + 0.1).toFixed(4);
  
  return balance;
};

/**
 * Get a specific token's balance by mint address
 * This is a placeholder for future implementation
 */
export const getTokenBalance = async (
  walletAddress: string, 
  mintAddress: string
): Promise<string | null> => {
  if (mintAddress === 'So11111111111111111111111111111111111111112') {
    return await getSolanaBalance(walletAddress);
  }
  
  // Here you would implement the actual token balance fetching logic for other tokens
  return null;
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
