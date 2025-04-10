
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Coins } from 'lucide-react';
import { getSolanaBalance, getTokenInfo } from '@/utils/token-utils';

interface WalletBalanceProps {
  className?: string;
  visibleTokens?: string[];
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ 
  className = '',
  visibleTokens = ['So11111111111111111111111111111111111111112'] // Default to SOL
}) => {
  const { walletType, walletAddress, network } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress || !walletType) return;
      
      setLoading(true);
      try {
        // Only show Solana tokens when on Solana network
        if (network === 'solana') {
          // Get the balance for the default SOL token
          const solMint = visibleTokens[0]; // Just use the first one (SOL)
          const solBalance = await getSolanaBalance(walletAddress);
          setBalance(solBalance);
        } else {
          setBalance(null);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    // Set up a refresh interval
    const intervalId = setInterval(fetchBalance, 30000); // every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [walletAddress, walletType, network, visibleTokens]);

  if (!walletAddress || !walletType || !balance || network !== 'solana') return null;

  // Get token info for display
  const tokenInfo = getTokenInfo(visibleTokens[0]);
  const symbol = tokenInfo?.symbol || 'SOL';

  return (
    <div className={`flex items-center px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium ${className}`}>
      <Coins className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
      {loading ? (
        <div className="w-10 h-4 bg-gray-200 animate-pulse rounded" />
      ) : (
        <span>
          {balance} {symbol}
        </span>
      )}
    </div>
  );
};

export default WalletBalance;
