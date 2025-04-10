
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Coins, AlertCircle } from 'lucide-react';
import { getTokenBalance, getTokenInfo } from '@/utils/token-utils';
import { getVisibleTokensForNetwork } from '@/config/tokenConfig';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface WalletBalanceProps {
  className?: string;
  tokenMint?: string; // Allow specifying a specific token
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ 
  className = '',
  tokenMint
}) => {
  const { walletType, walletAddress, network } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset error state when wallet changes
  useEffect(() => {
    setHasError(false);
    setErrorMessage(null);
  }, [walletAddress, walletType]);

  useEffect(() => {
    // Determine which token to show
    if (tokenMint) {
      setCurrentToken(tokenMint);
    } else if (network) {
      // Use the first visible token for the current network
      const visibleTokens = getVisibleTokensForNetwork(network);
      setCurrentToken(visibleTokens.length > 0 ? visibleTokens[0] : null);
    } else {
      setCurrentToken(null);
    }
  }, [tokenMint, network]);

  useEffect(() => {
    // If there was a previous error, don't try to fetch more often than every 30 seconds
    const fetchBalance = async () => {
      if (!walletAddress || !walletType || !currentToken) {
        setBalance(null);
        return;
      }
      
      setLoading(true);
      try {
        const tokenBalance = await getTokenBalance(walletAddress, currentToken);
        setBalance(tokenBalance);
        setHasError(false);
        setErrorMessage(null);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setHasError(true);
        setErrorMessage('API access denied');
        setBalance('0.0000');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    
    // Update every 30 seconds
    const intervalId = setInterval(fetchBalance, 30000);
    return () => clearInterval(intervalId);
  }, [walletAddress, walletType, currentToken, hasError]);

  if (!walletAddress || !walletType || !currentToken) return null;

  // Token info for display
  const tokenInfo = getTokenInfo(currentToken);
  const symbol = tokenInfo?.symbol || '???';

  return (
    <div className={`flex items-center px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium ${className}`}>
      <Coins className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
      {loading ? (
        <div className="w-10 h-4 bg-gray-200 animate-pulse rounded" />
      ) : (
        <span>
          {balance || '0'} {symbol}
          {hasError && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-3.5 w-3.5 ml-1 text-amber-500 inline" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">API access denied. Showing default balance.</p>
              </TooltipContent>
            </Tooltip>
          )}
        </span>
      )}
    </div>
  );
};

export default WalletBalance;
