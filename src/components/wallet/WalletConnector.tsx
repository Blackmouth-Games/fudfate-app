
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWallet, WalletType } from '@/contexts/WalletContext';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';

const WalletConnector: React.FC = () => {
  const { connected, walletAddress, walletType, connectWallet, disconnectWallet } = useWallet();
  const { t } = useTranslation();

  // Format wallet address to show first and last few characters
  const formatAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  // Handle wallet connection
  const handleConnect = async (type: WalletType) => {
    await connectWallet(type);
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      {!connected ? (
        <>
          <Button 
            onClick={() => handleConnect('phantom')}
            className="w-full sm:w-auto font-medium text-white"
            style={{ backgroundColor: '#AB9FF2', borderColor: '#9887E0' }}
          >
            <img 
              src="/img/icons/Phantom-Icon_Transparent_White.svg" 
              alt="Phantom" 
              className="w-5 h-5 mr-2"
            />
            {t('wallet.connectPhantom')}
          </Button>
          
          <Button 
            onClick={() => handleConnect('metamask')}
            className="w-full sm:w-auto font-medium text-black"
            style={{ backgroundColor: '#FFA680', borderColor: '#FF8A57' }}
          >
            <img 
              src="/img/icons/MetaMask-icon-fox.svg" 
              alt="Metamask" 
              className="w-5 h-5 mr-2"
            />
            {t('wallet.connectMetamask')}
          </Button>
        </>
      ) : (
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-gray-100 py-2 px-4 rounded-full border border-gray-200">
            <Wallet className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-800">
              {formatAddress(walletAddress)}
            </span>
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
          </div>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={disconnectWallet}
          >
            {t('wallet.disconnect')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
