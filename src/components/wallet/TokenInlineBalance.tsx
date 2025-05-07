import React, { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { getTokenBalance, getTokenInfo } from '@/utils/token-utils';

interface TokenInlineBalanceProps {
  mintAddress: string;
  iconUrl?: string;
}

const TokenInlineBalance: React.FC<TokenInlineBalanceProps> = ({ mintAddress, iconUrl }) => {
  const { walletAddress, connected } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const tokenInfo = getTokenInfo(mintAddress);

  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    getTokenBalance(walletAddress, mintAddress).then(bal => {
      setBalance(bal || '0');
      setLoading(false);
    });
  }, [walletAddress, mintAddress]);

  // Log para depuración
  console.log('Token:', mintAddress, 'icon:', iconUrl || tokenInfo?.icon);

  if (!connected) return null;

  return (
    <div className="flex items-center ml-2 px-2 py-1 bg-gray-100 rounded-full text-sm font-medium">
      {loading ? (
        <span className="w-8 h-4 bg-gray-200 animate-pulse rounded" />
      ) : (
        <span>{balance}</span>
      )}
      {(iconUrl || tokenInfo?.icon) && showIcon && (
        <img
          src={iconUrl || tokenInfo?.icon}
          alt={tokenInfo?.symbol || 'Token'}
          className="w-4 h-4 ml-1"
          onError={() => setShowIcon(false)}
        />
      )}
    </div>
  );
};

export default TokenInlineBalance; 