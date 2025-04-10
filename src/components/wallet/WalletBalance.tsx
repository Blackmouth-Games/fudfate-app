
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Coins } from 'lucide-react';
import { getSolanaBalance } from '@/utils/token-utils';

interface WalletBalanceProps {
  className?: string;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ className = '' }) => {
  const { walletType, walletAddress, network } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress || !walletType) return;
      
      setLoading(true);
      try {
        // Only show Solana tokens
        if (network === 'solana') {
          // Get the real balance using our utility function
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
  }, [walletAddress, walletType, network]);

  if (!walletAddress || !walletType || !balance || network !== 'solana') return null;

  return (
    <div className={`flex items-center px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium ${className}`}>
      <Coins className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
      {loading ? (
        <div className="w-10 h-4 bg-gray-200 animate-pulse rounded" />
      ) : (
        <span>
          {balance} SOL
        </span>
      )}
    </div>
  );
};

export default WalletBalance;
