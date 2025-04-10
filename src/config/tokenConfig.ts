
/**
 * Configuration for which tokens to display in the wallet UI
 */

// Tokens disponibles por red
export const NETWORK_TOKENS = {
  // Solana tokens
  solana: [
    'So11111111111111111111111111111111111111112', // SOL nativo
    // Puedes añadir más tokens de Solana aquí
  ],
  
  // Ethereum tokens (mainnet)
  ethereum: [
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // ETH nativo
    // Puedes añadir más tokens de Ethereum aquí
  ],
  
  // Polygon tokens
  polygon: [
    '0x0000000000000000000000000000000000001010', // MATIC nativo
    // Puedes añadir más tokens de Polygon aquí
  ],
};

// Tokens visibles por defecto para cada red
export const DEFAULT_VISIBLE_TOKENS = {
  solana: ['So11111111111111111111111111111111111111112'], // SOL por defecto
  ethereum: ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'], // ETH por defecto
  polygon: ['0x0000000000000000000000000000000000001010'], // MATIC por defecto
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
