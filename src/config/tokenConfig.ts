
/**
 * Configuration for which tokens to display in the wallet UI
 */

// Default visible tokens
export const DEFAULT_VISIBLE_TOKENS = [
  'So11111111111111111111111111111111111111112', // SOL
];

// Configuration for token display per network
export const TOKEN_DISPLAY_CONFIG = {
  solana: DEFAULT_VISIBLE_TOKENS,
  ethereum: [],
  polygon: [],
  // Can add more networks as needed
};

/**
 * Gets the list of token mint addresses that should be visible
 * for a given network
 */
export const getVisibleTokensForNetwork = (network: string): string[] => {
  return TOKEN_DISPLAY_CONFIG[network as keyof typeof TOKEN_DISPLAY_CONFIG] || [];
};
