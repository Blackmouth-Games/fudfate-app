import React, { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { getTokenBalance, getTokenInfo } from '@/utils/token-utils';
import { AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface TokenInlineBalanceProps {
  mintAddress: string;
  iconUrl?: string;
  addConnectionLog?: (type: string, message: string, details?: any) => void;
}

const TokenInlineBalance: React.FC<TokenInlineBalanceProps> = ({ mintAddress, iconUrl, addConnectionLog }) => {
  const { walletAddress, connected } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const tokenInfo = getTokenInfo(mintAddress);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    getTokenBalance(walletAddress, mintAddress, addConnectionLog)
      .then(bal => {
        setBalance(bal || '0');
        setLoading(false);
        if (addConnectionLog && (bal === '0.0000' || bal === null)) {
          addConnectionLog(
            'balance_warning',
            `El balance de ${(tokenInfo?.symbol || mintAddress)} es 0 para la wallet ${walletAddress}. Puede ser un error de red, de red incorrecta o la wallet realmente no tiene saldo.`,
            { mintAddress, walletAddress }
          );
        }
      })
      .catch(async error => {
        setLoading(false);
        let errorDetail: any = {};
        if (error instanceof Response) {
          // Si es un Response de fetch, intenta leer el body
          let bodyText = '';
          try {
            bodyText = await error.text();
          } catch {}
          errorDetail = {
            message: `HTTP error: ${error.status} ${error.statusText}`,
            status: error.status,
            statusText: error.statusText,
            body: bodyText,
            error: error
          };
        } else if (typeof error === 'object' && error !== null && Object.keys(error).length === 0) {
          // Objeto vacío
          errorDetail = {
            message: 'Unknown error (empty object)',
            keys: Object.keys(error),
            props: Object.getOwnPropertyNames(error),
            error: error
          };
        } else {
          errorDetail = {
            message: error?.message || String(error),
            stack: error?.stack || null,
            error: error
          };
        }
        setError(errorDetail);
        if (addConnectionLog) {
          addConnectionLog(
            'balance_warning',
            `Error al obtener el balance de ${(tokenInfo?.symbol || mintAddress)} para la wallet ${walletAddress}: ${errorDetail.message}`,
            { mintAddress, walletAddress, ...errorDetail }
          );
        }
      });
  }, [walletAddress, mintAddress, addConnectionLog]);

  // Log para depuración
  console.log('Token:', mintAddress, 'icon:', iconUrl || tokenInfo?.icon);

  if (!connected) return null;

  return (
    <div className="flex items-center ml-2 px-2 py-1 bg-gray-100 rounded-full text-sm font-medium">
      {loading ? (
        <span className="w-8 h-4 bg-gray-200 animate-pulse rounded" />
      ) : error ? (
        <div className="flex items-center gap-1 flex-nowrap">
          <AlertCircle className="w-4 h-4 text-amber-500 mr-1" />
          <button
            className="px-2 py-0.5 rounded bg-gray-200 text-xs border border-gray-300 hover:bg-gray-300 transition"
            onClick={() => {
              const now = new Date();
              const meta = [
                `Fecha/Hora: ${now.toISOString()}`,
                `User Agent: ${navigator.userAgent}`,
                `URL: ${window.location.href}`
              ].join('\n');
              const errorText = [
                meta,
                `Error: ${typeof error === 'object' && error !== null ? error.message : String(error)}`,
                `Stack: ${typeof error === 'object' && error?.stack ? error.stack : ''}`,
                `Status: ${typeof error === 'object' && error?.status ? error.status + ' ' + error.statusText : ''}`,
                `Body: ${typeof error === 'object' && error?.body ? error.body : ''}`,
                `Keys: ${typeof error === 'object' && error?.keys ? JSON.stringify(error.keys) : ''}`,
                `Props: ${typeof error === 'object' && error?.props ? JSON.stringify(error.props) : ''}`,
                `Mint: ${mintAddress}`,
                `Wallet: ${walletAddress}`,
                `Raw: ${JSON.stringify(error)}`
              ].join('\n');
              navigator.clipboard.writeText(errorText);
              toast.success('Error copiado al portapapeles');
            }}
          >
            Copiar error
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-1 cursor-pointer">🛈</span>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs break-all max-w-xs overflow-x-auto" style={{ maxWidth: 300 }}>
                <div><b>Error:</b> {typeof error === 'object' && error !== null ? error.message : String(error)}</div>
                {typeof error === 'object' && error?.stack && <div><b>Stack:</b> {error.stack}</div>}
                {typeof error === 'object' && error?.status && <div><b>Status:</b> {error.status} {error.statusText}</div>}
                {typeof error === 'object' && error?.body && <div><b>Body:</b> {error.body}</div>}
                {typeof error === 'object' && error?.keys && <div><b>Keys:</b> {JSON.stringify(error.keys)}</div>}
                {typeof error === 'object' && error?.props && <div><b>Props:</b> {JSON.stringify(error.props)}</div>}
                <div><b>Mint:</b> {mintAddress}</div>
                <div><b>Wallet:</b> {walletAddress}</div>
                <div><b>Raw:</b> {JSON.stringify(error)}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
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