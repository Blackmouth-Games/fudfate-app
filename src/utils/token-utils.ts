// Token utilities for handling balances and token info

import { TOKEN_INFO } from '@/config/tokenConfig';

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
    
    // If balance is suspiciously high (more than 10000 SOL) on a test environment,
    // consider it a test environment balance issue and return 0
    if (parseFloat(solBalance) > 10000) {
      console.warn('Unrealistic SOL balance detected, possibly test environment. Returning 0.');
      return '0.0000';
    }
    
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
  
  try {
    // Use the Solana RPC API to get token account info
    const response = await fetch(`https://api.mainnet-beta.solana.com`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          walletAddress,
          {
            mint: mintAddress
          },
          {
            encoding: 'jsonParsed'
          }
        ]
      }),
    });

    if (!response.ok) {
      console.warn(`Error accessing Solana API: ${response.status} ${response.statusText}`);
      return '0.0000';
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('Error getting token balance:', data.error);
      return '0.0000';
    }

    // Get token info to know decimals
    const tokenInfo = getTokenInfo(mintAddress);
    const decimals = tokenInfo?.decimals || 9;

    // Calculate balance from token accounts
    let totalBalance = 0;
    if (data.result?.value) {
      for (const account of data.result.value) {
        const balance = account.account.data.parsed.info.tokenAmount.uiAmount;
        totalBalance += balance;
      }
    }

    return totalBalance.toFixed(decimals);
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return '0.0000';
  }
};

/**
 * Get info about a token by its mint address
 */
export const getTokenInfo = (mintAddress: string): TokenInfo | null => {
  const tokenInfo = TOKEN_INFO[mintAddress];
  if (!tokenInfo) return null;
  return {
    symbol: tokenInfo.symbol,
    decimals: tokenInfo.decimals,
    name: tokenInfo.name,
    icon: tokenInfo.icon
  };
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
