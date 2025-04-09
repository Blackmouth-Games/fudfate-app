
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet, WalletType } from '@/contexts/WalletContext';
import { useTranslation } from 'react-i18next';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WalletConnector: React.FC = () => {
  const { connected, walletAddress, walletType, connectWallet, disconnectWallet } = useWallet();
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState<WalletType | null>(null);

  // Format wallet address to show first and last few characters
  const formatAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  // Handle wallet connection
  const handleConnect = async (type: WalletType) => {
    setIsConnecting(type);
    try {
      await connectWallet(type);
    } finally {
      setIsConnecting(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      {!connected ? (
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button 
            onClick={() => handleConnect('phantom')}
            disabled={isConnecting !== null}
            className="w-full sm:w-auto font-medium text-white"
            style={{ backgroundColor: '#AB9FF2', borderColor: '#9887E0' }}
          >
            <img 
              src="/img/icons/Phantom-Icon_Transparent_White.svg" 
              alt="Phantom" 
              className="w-5 h-5 mr-2"
            />
            {isConnecting === 'phantom' ? t('wallet.connecting') : t('wallet.connectPhantom')}
          </Button>
          
          <Button 
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting !== null}
            className="w-full sm:w-auto font-medium text-black"
            style={{ backgroundColor: '#FFA680', borderColor: '#FF8A57' }}
          >
            <img 
              src="/img/icons/MetaMask-icon-fox.svg" 
              alt="Metamask" 
              className="w-5 h-5 mr-2"
            />
            {isConnecting === 'metamask' ? t('wallet.connecting') : t('wallet.connectMetamask')}
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-gray-100 py-2 px-4 rounded-full border border-gray-200">
              {walletType === 'phantom' ? (
                <img 
                  src="/img/icons/Phantom-Icon_Transparent_Purple.svg" 
                  alt="Phantom" 
                  className="w-4 h-4"
                />
              ) : (
                <img 
                  src="/img/icons/MetaMask-icon-fox.svg" 
                  alt="Metamask" 
                  className="w-4 h-4"
                />
              )}
              <span className="text-sm font-medium text-gray-800">
                {formatAddress(walletAddress)}
              </span>
              <div className="h-2 w-2 rounded-full bg-green-400 mr-1"></div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={disconnectWallet} className="text-red-500 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              {t('wallet.disconnect')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default WalletConnector;
