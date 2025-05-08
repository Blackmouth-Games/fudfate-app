import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet, WalletType } from '@/contexts/WalletContext';
import { useTranslation } from 'react-i18next';
import { Wallet, ChevronDown, LogOut, Loader2, ExternalLink } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import RocketCelebration from '@/components/animations/RocketCelebration';
import QRCode from 'qrcode.react';

interface WalletConnectorProps {
  showButtons?: boolean;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ showButtons = true }) => {
  const { connected, walletAddress, walletType, connectWallet, disconnectWallet } = useWallet();
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState<WalletType | null>(null);
  const [isPhantomAvailable, setIsPhantomAvailable] = useState(false);
  const [isSolflareAvailable, setIsSolflareAvailable] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const [copied, setCopied] = useState(false);

  // Check wallet availability on component mount
  useEffect(() => {
    const checkWallets = () => {
      setIsPhantomAvailable(!!window.solana && !!window.solana.isPhantom);
      setIsSolflareAvailable(!!window.solflare);
    };

    checkWallets(); // Comprobar al montar

    window.addEventListener('focus', checkWallets); // Comprobar al volver a la pestaña

    return () => {
      window.removeEventListener('focus', checkWallets);
    };
  }, []);

  // Format wallet address to show first and last few characters
  const formatAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  // Handle wallet connection
  const handleConnect = async (type: WalletType) => {
    // Check if the wallet is available before attempting to connect
    if (type === 'phantom' && !isPhantomAvailable) {
      toast.error(t('wallet.phantomNotInstalled'), {
        description: "Please install Phantom wallet to connect.",
        action: {
          label: "Install",
          onClick: () => window.open("https://phantom.app/", "_blank")
        }
      });
      return;
    }
    
    if (type === 'solflare' && !isSolflareAvailable) {
      toast.error(t('wallet.solflareNotInstalled'), {
        description: "Please install Solflare wallet to connect.",
        action: {
          label: "Install",
          onClick: () => window.open("https://solflare.com/", "_blank")
        }
      });
      return;
    }
    
    setIsConnecting(type);
    try {
      const success = await connectWallet(type);
      if (success) {
        // Trigger celebration after successful connection
        setShowCelebration(true);
      }
    } catch (error) {
      console.error("Error in handleConnect:", error);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleCopyUrl = () => {
    if (navigator.clipboard && currentUrl) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If not showing buttons and not connected, return nothing
  if (!showButtons && !connected) {
    return null;
  }

  return (
    <div className="relative">
      <RocketCelebration 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
      />
      
      {connected ? (
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
                  src="/img/icons/Solflare_id5j73wBTF_1.svg" 
                  alt="Solflare" 
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
              {t('wallet.disconnectWallet')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex flex-col gap-3 w-full">
          {!isMobile && (
            <>
              <Button 
                onClick={() => handleConnect('phantom')}
                disabled={isConnecting !== null || !isPhantomAvailable}
                className={`w-full font-medium text-white ${!isPhantomAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    {isPhantomAvailable ? t('wallet.connectToPhantom') : (
                      <div className="flex items-center">
                        {t('wallet.phantomNotInstalled')}
                        <ExternalLink className="ml-1 h-3 w-3" onClick={(e) => {
                          e.stopPropagation();
                          window.open("https://phantom.app/", "_blank");
                        }} />
                      </div>
                    )}
                  </>
                )}
              </Button>
              <Button 
                onClick={() => handleConnect('solflare')}
                disabled={isConnecting !== null || !isSolflareAvailable}
                className={`w-full font-medium text-black ${!isSolflareAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: '#FFEF46', borderColor: '#EEDA0F' }}
              >
                {isConnecting === 'solflare' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('wallet.connecting')}
                  </>
                ) : (
                  <>
                    <img 
                      src="/img/icons/Solflare_id5j73wBTF_1.svg" 
                      alt="Solflare" 
                      className="w-5 h-5 mr-2"
                    />
                    {isSolflareAvailable ? t('wallet.connectToSolflare') : (
                      <div className="flex items-center">
                        {t('wallet.solflareNotInstalled')}
                        <ExternalLink className="ml-1 h-3 w-3" onClick={(e) => {
                          e.stopPropagation();
                          window.open("https://solflare.com/", "_blank");
                        }} />
                      </div>
                    )}º o
                  </>
                )}
              </Button>
            </>
          )}
          {isMobile && (
            <>
              <Button
                onClick={async () => {
                  if (typeof window !== 'undefined' && !window.solflare) {
                    // Copia la URL antes de abrir la app
                    if (navigator.clipboard && window.location.href) {
                      await navigator.clipboard.writeText(window.location.href);
                      toast.success('URL copiada. Pégala en el navegador de Solflare.');
                    }
                    window.open('solflare://', '_blank');
                  } else {
                    handleConnect('solflare');
                  }
                }}
                disabled={isConnecting !== null}
                className="w-full font-medium text-black"
                style={{ backgroundColor: '#FFEF46', borderColor: '#EEDA0F' }}
              >
                {isConnecting === 'solflare' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('wallet.connecting')}
                  </>
                ) : (
                  <>
                    <img 
                      src="/img/icons/Solflare_id5j73wBTF_1.svg" 
                      alt="Solflare" 
                      className="w-5 h-5 mr-2"
                    />
                    <span>Conectar con Solflare</span>
                  </>
                )}
              </Button>
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-900 text-xs text-center">
                {t('wallet.mobileConnectHint')}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
