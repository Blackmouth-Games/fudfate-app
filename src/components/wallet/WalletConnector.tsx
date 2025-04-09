
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet, WalletType } from '@/contexts/WalletContext';
import { useTranslation } from 'react-i18next';
import { Wallet, ChevronDown, LogOut, Loader2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WalletConnectorProps {
  showButtons?: boolean;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ showButtons = true }) => {
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
      console.log(`Attempting to connect ${type} wallet`);
      const success = await connectWallet(type);
      console.log(`Connection attempt result: ${success}`);
      // Only clear the connecting state if we successfully connected or an error occurred
      if (!success) {
        setIsConnecting(null);
      }
    } catch (error) {
      console.error("Error in handleConnect:", error);
      setIsConnecting(null);
    }
  };

  // If not showing buttons and not connected, return nothing
  if (!showButtons && !connected) {
    return null;
  }

  // If connected, show wallet info regardless of showButtons prop
  if (connected) {
    return (
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
    );
  }

  // If not connected and showButtons is true, show connect buttons
  return (
    <div className="flex flex-col gap-3 w-full">
      <Button 
        onClick={() => handleConnect('metamask')}
        disabled={isConnecting !== null}
        className="w-full font-medium text-black"
        style={{ backgroundColor: '#FFA680', borderColor: '#FF8A57' }}
      >
        {isConnecting === 'metamask' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('wallet.connecting')}
          </>
        ) : (
          <>
            <img 
              src="/img/icons/MetaMask-icon-fox.svg" 
              alt="Metamask" 
              className="w-5 h-5 mr-2"
            />
            {t('wallet.connectMetamask')}
          </>
        )}
      </Button>
      
      <Button 
        onClick={() => handleConnect('phantom')}
        disabled={isConnecting !== null}
        className="w-full font-medium text-white"
        style={{ backgroundColor: '#AB9FF2', borderColor: '#9887E0' }}
      >
        {isConnecting === 'phantom' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('wallet.connecting')}
          </>
        ) : (
          <>
            <img 
              src="/img/icons/Phantom-Icon_Transparent_White.svg" 
              alt="Phantom" 
              className="w-5 h-5 mr-2"
            />
            {t('wallet.connectPhantom')}
          </>
        )}
      </Button>
    </div>
  );
};

export default WalletConnector;
