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

const SOLANA_RPC_URL = 'https://solana-mainnet.g.alchemy.com/v2/WxXnJ7G5b18ho3IyvoET55AiOGKV8oTP';

/**
 * Get the balance of SOL for a given wallet address
 * Uses the Solana blockchain API with proper error handling
 */
export const getSolanaBalance = async (walletAddress: string, addConnectionLog?: Function): Promise<string> => {
  try {
    if (addConnectionLog) addConnectionLog('balance_request', `SOL balance for ${walletAddress}`);
    const response = await fetch(SOLANA_RPC_URL, {
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
    if (addConnectionLog) addConnectionLog('balance_response', `SOL balance response for ${walletAddress}`, response);
    if (!response.ok) {
      if (addConnectionLog) addConnectionLog('balance_error', `SOL balance error for ${walletAddress}`, response.statusText);
      return '0.0000';
    }
    const data = await response.json();
    if (addConnectionLog) addConnectionLog('balance_response', `SOL balance response for ${walletAddress}`, data);
    if (data.error) {
      if (addConnectionLog) addConnectionLog('balance_error', `SOL balance error for ${walletAddress}`, data.error);
      return '0.0000';
    }
    const lamports = data.result?.value || 0;
    const solBalance = (lamports / 1000000000).toFixed(4);
    if (parseFloat(solBalance) > 10000) {
      return '0.0000';
    }
    return solBalance;
  } catch (error) {
    if (addConnectionLog) addConnectionLog('balance_error', `SOL balance error for ${walletAddress}`, error);
    return '0.0000';
  }
};

/**
 * Get a specific token's balance by mint address
 */
export const getTokenBalance = async (
  walletAddress: string, 
  mintAddress: string,
  addConnectionLog?: Function
): Promise<string | null> => {
  if (mintAddress === 'So11111111111111111111111111111111111111112') {
    return await getSolanaBalance(walletAddress, addConnectionLog);
  }
  
  try {
    if (addConnectionLog) addConnectionLog('balance_request', `Token balance for ${walletAddress} - ${mintAddress}`);
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenAccountsByOwner',
      params: [
        walletAddress,
        { mint: mintAddress },
        { encoding: 'jsonParsed' }
      ]
    };
    const response = await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    if (addConnectionLog) addConnectionLog('balance_response', `Token balance response for ${walletAddress} - ${mintAddress}`, { status: response.status, statusText: response.statusText });
    if (!response.ok) {
      let bodyText = '';
      try { bodyText = await response.text(); } catch {}
      if (addConnectionLog) addConnectionLog('balance_error', `Token balance error for ${walletAddress} - ${mintAddress}`, { status: response.status, statusText: response.statusText, body: bodyText, request: requestBody });
      return '0.0000';
    }
    const data = await response.json();
    if (addConnectionLog) addConnectionLog('balance_response', `Token balance response for ${walletAddress} - ${mintAddress}`, data);
    if (data.error) {
      if (addConnectionLog) addConnectionLog('balance_error', `Token balance error for ${walletAddress} - ${mintAddress}`, { error: data.error, request: requestBody });
      return '0.0000';
    }
    const tokenInfo = getTokenInfo(mintAddress);
    const decimals = tokenInfo?.decimals || 9;
    let totalBalance = 0;
    if (data.result?.value && Array.isArray(data.result.value)) {
      if (data.result.value.length === 0) {
        if (addConnectionLog) addConnectionLog('balance_warning', `El usuario nunca ha recibido el token ${mintAddress} (no hay cuentas asociadas)`, { walletAddress, mintAddress, request: requestBody });
        return '0.0000';
      }
      for (const account of data.result.value) {
        const balance = account.account.data.parsed.info.tokenAmount.uiAmount;
        totalBalance += balance;
      }
    } else {
      if (addConnectionLog) addConnectionLog('balance_warning', `Respuesta inesperada al consultar el balance del token ${mintAddress}`, { walletAddress, mintAddress, data, request: requestBody });
      return '0.0000';
    }
    return totalBalance.toFixed(decimals);
  } catch (error: any) {
    let errorDetail: any = {};
    if (error instanceof Response) {
      let bodyText = '';
      try { bodyText = await error.text(); } catch {}
      errorDetail = {
        message: `HTTP error: ${error.status} ${error.statusText}`,
        status: error.status,
        statusText: error.statusText,
        body: bodyText,
        error: error
      };
    } else if (typeof error === 'object' && error !== null && Object.keys(error).length === 0) {
      errorDetail = {
        message: 'Unknown error (empty object)',
        keys: Object.keys(error),
        props: Object.getOwnPropertyNames(error),
        error: error
      };
    } else {
      errorDetail = {
        message: error?.message || String(error),
        stack: error?.stack || null,
        error: error
      };
    }
    if (addConnectionLog) addConnectionLog('balance_error', `Token balance error for ${walletAddress} - ${mintAddress}`, errorDetail);
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
