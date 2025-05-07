/**
 * Configuration for which tokens to display in the wallet UI
 */

// Tokens disponibles por red
export const NETWORK_TOKENS = {
  // Solana tokens
  solana: [
    'So11111111111111111111111111111111111111112', // SOL nativo
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
    '7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4mRx', // BONK
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', // mSOL
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', // stSOL
    'rndrizKT3MK1iimdxRdWabcF7Zb7nx9wkxvy8i6Wt9', // RNDR
    '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', // SAMO
  ],
  
  // Ethereum tokens (mainnet)
  ethereum: [
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // ETH nativo
  ],
  
  // Polygon tokens
  polygon: [
    '0x0000000000000000000000000000000000001010', // MATIC nativo
  ],
};

// Tokens visibles por defecto para cada red
export const DEFAULT_VISIBLE_TOKENS = {
  solana: ['So11111111111111111111111111111111111111112'], // SOL por defecto
  ethereum: ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'], // ETH por defecto
  polygon: ['0x0000000000000000000000000000000000001010'], // MATIC por defecto
};

// Token info mapping
export const TOKEN_INFO: Record<string, { symbol: string; decimals: number; name: string; icon?: string }> = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    decimals: 9,
    name: 'Solana',
    icon: '/img/icons/sol.png'
  },
  '43YakhC3TcSuTgSXnxFgw8uKL8VkuLuFa4M6Bninpump': {
    symbol: 'LCSHIB',
    decimals: 9,
    name: 'LC SHIB',
    // icon: '/img/icons/lcshib.png' // Agrega aquí el icono cuando lo tengas
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin'
  },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
    symbol: 'USDT',
    decimals: 6,
    name: 'Tether USD'
  },
  '7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4mRx': {
    symbol: 'BONK',
    decimals: 5,
    name: 'Bonk'
  },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
    symbol: 'BONK',
    decimals: 5,
    name: 'Bonk'
  },
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': {
    symbol: 'mSOL',
    decimals: 9,
    name: 'Marinade Staked SOL'
  },
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': {
    symbol: 'stSOL',
    decimals: 9,
    name: 'Lido Staked SOL'
  },
  'rndrizKT3MK1iimdxRdWabcF7Zb7nx9wkxvy8i6Wt9': {
    symbol: 'RNDR',
    decimals: 9,
    name: 'Render Token'
  },
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU': {
    symbol: 'SAMO',
    decimals: 9,
    name: 'Samoyedcoin'
  }
};

/**
 * Gets the list of token mint addresses that should be visible
 * for a given network
 */
export const getVisibleTokensForNetwork = (network: string): string[] => {
  // Si la red existe en la configuración, devolver sus tokens visibles
  if (network in DEFAULT_VISIBLE_TOKENS) {
    return DEFAULT_VISIBLE_TOKENS[network as keyof typeof DEFAULT_VISIBLE_TOKENS];
  }
  
  // Si no, devolver una lista vacía
  return [];
};

/**
 * Gets all available tokens for a given network
 */
export const getAvailableTokensForNetwork = (network: string): string[] => {
  if (network in NETWORK_TOKENS) {
    return NETWORK_TOKENS[network as keyof typeof NETWORK_TOKENS];
  }
  
  return [];
};

/**
 * Updates which tokens are visible for a given network
 */
export const setVisibleTokensForNetwork = (network: string, tokenMints: string[]): void => {
  // Esta es una implementación simple que solo actualiza en memoria
  // En una aplicación real, esto podría guardarse en localStorage o en una base de datos
  if (network in DEFAULT_VISIBLE_TOKENS) {
    DEFAULT_VISIBLE_TOKENS[network as keyof typeof DEFAULT_VISIBLE_TOKENS] = tokenMints;
  }
};
