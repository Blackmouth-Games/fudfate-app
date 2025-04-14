
/**
 * Wallet Connection Security Utilities
 * This module provides security-focused functions for wallet connections.
 */

// Types of security checks
export type SecurityCheckType = 'connection' | 'transaction' | 'permissions' | 'site';

// Result of a security check
export interface SecurityCheckResult {
  checkType: SecurityCheckType;
  passed: boolean;
  warnings: string[];
  recommendations: string[];
}

/**
 * Verify the page connection is secure
 */
export const verifySecureConnection = (): SecurityCheckResult => {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let passed = true;
  
  // Check if using HTTPS (not applicable in development)
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  if (!isLocalhost && window.location.protocol !== 'https:') {
    warnings.push('The connection is not secure. Your wallet data could be compromised.');
    recommendations.push('Always ensure you connect your wallet on sites using HTTPS.');
    passed = false;
  }
  
  // Check for suspicious domains (phishing protection)
  const knownPhishingPatterns = ['walllet', 'metamaks', 'phanttom', 'walett'];
  const hostname = window.location.hostname;
  
  for (const pattern of knownPhishingPatterns) {
    if (hostname.includes(pattern)) {
      warnings.push(`Suspicious domain detected: ${hostname} may be a phishing attempt.`);
      recommendations.push('Verify you\'re on the correct website before connecting your wallet.');
      passed = false;
    }
  }
  
  return {
    checkType: 'connection',
    passed,
    warnings,
    recommendations
  };
};

/**
 * Check wallet permissions being requested
 */
export const checkWalletPermissions = (walletType: string): SecurityCheckResult => {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let passed = true;
  
  // Different checks based on wallet type
  if (walletType === 'metamask') {
    // MetaMask specific checks
    if (window.ethereum && window.ethereum._metamask) {
      // Check if site is requesting extended permissions
      if (localStorage.getItem('metamask_extended_permissions')) {
        warnings.push('This site is requesting extended permissions from MetaMask.');
        recommendations.push('Only approve necessary permissions for this application to function.');
        passed = false;
      }
    }
  } else if (walletType === 'phantom') {
    // Phantom specific checks
    if (localStorage.getItem('phantom_extended_permissions')) {
      warnings.push('This site is requesting extended permissions from Phantom.');
      recommendations.push('Be cautious about approving transaction signing permissions.');
      passed = false;
    }
  }
  
  return {
    checkType: 'permissions',
    passed,
    warnings,
    recommendations
  };
};

/**
 * Run a full security check for wallet connection
 */
export const performWalletSecurityCheck = (walletType: string | null): SecurityCheckResult[] => {
  const results: SecurityCheckResult[] = [];
  
  // Check connection security
  results.push(verifySecureConnection());
  
  // Check wallet-specific permissions if a wallet is specified
  if (walletType) {
    results.push(checkWalletPermissions(walletType));
  }
  
  // Check site security
  results.push({
    checkType: 'site',
    passed: true,
    warnings: [],
    recommendations: [
      'Always verify the URL before connecting your wallet',
      'Never share your seed phrase or private keys with anyone',
      'Disconnect your wallet when you\'re done using the application'
    ]
  });
  
  return results;
};

/**
 * Generate user-friendly security tips
 */
export const getWalletSecurityTips = (): string[] => {
  return [
    'Never share your seed phrase or private keys with anyone, including website support',
    'Always verify the URL is correct before connecting your wallet',
    'Use a hardware wallet for storing significant amounts of cryptocurrency',
    'Consider using a separate browser profile for cryptocurrency transactions',
    'Disconnect your wallet when you\'re done using a dApp',
    'Review all transaction details before confirming',
    'Be cautious of phishing attempts requesting wallet connection'
  ];
};

/**
 * Check if a wallet is properly implemented and not spoofed
 */
export const checkWalletImplementation = (walletType: string): boolean => {
  if (walletType === 'metamask') {
    // Verify MetaMask is properly implemented
    return !!(window.ethereum && window.ethereum.isMetaMask);
  } else if (walletType === 'phantom') {
    // Verify Phantom is properly implemented
    return !!(window.solana && window.solana.isPhantom);
  }
  
  return false;
};
