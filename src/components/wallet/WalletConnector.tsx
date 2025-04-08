
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
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <img 
              src="https://phantom.app/img/logo.png" 
              alt="Phantom" 
              className="w-5 h-5 mr-2"
            />
            {t('wallet.connectPhantom')}
          </Button>
          
          <Button 
            onClick={() => handleConnect('metamask')}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
              alt="Metamask" 
              className="w-5 h-5 mr-2"
            />
            {t('wallet.connectMetamask')}
          </Button>
        </>
      ) : (
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-black/20 py-2 px-4 rounded-full">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">
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
