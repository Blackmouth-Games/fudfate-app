
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Coins } from 'lucide-react';
import { getTokenBalance, getTokenInfo } from '@/utils/token-utils';
import { getVisibleTokensForNetwork } from '@/config/tokenConfig';

interface WalletBalanceProps {
  className?: string;
  tokenMint?: string; // Permitir especificar un token específico
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ 
  className = '',
  tokenMint
}) => {
  const { walletType, walletAddress, network } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  useEffect(() => {
    // Determinar qué token mostrar
    if (tokenMint) {
      setCurrentToken(tokenMint);
    } else if (network) {
      // Usar el primer token visible para la red actual
      const visibleTokens = getVisibleTokensForNetwork(network);
      setCurrentToken(visibleTokens.length > 0 ? visibleTokens[0] : null);
    } else {
      setCurrentToken(null);
    }
  }, [tokenMint, network]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress || !walletType || !currentToken) {
        setBalance(null);
        return;
      }
      
      setLoading(true);
      try {
        const tokenBalance = await getTokenBalance(walletAddress, currentToken);
        setBalance(tokenBalance);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    
    // Actualizar cada 30 segundos
    const intervalId = setInterval(fetchBalance, 30000);
    return () => clearInterval(intervalId);
  }, [walletAddress, walletType, currentToken]);

  if (!walletAddress || !walletType || !currentToken) return null;

  // Información del token para mostrar
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
        </span>
      )}
    </div>
  );
};

export default WalletBalance;
