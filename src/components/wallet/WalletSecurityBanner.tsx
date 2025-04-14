
import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Info, X } from 'lucide-react';
import { performWalletSecurityCheck, SecurityCheckResult } from '@/utils/wallet-security';
import { useWallet } from '@/contexts/WalletContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const WalletSecurityBanner: React.FC = () => {
  const { walletType, connected } = useWallet();
  const [securityResults, setSecurityResults] = useState<SecurityCheckResult[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    if (connected && walletType) {
      setSecurityResults(performWalletSecurityCheck(walletType));
      setShowBanner(true);
      
      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [connected, walletType]);
  
  // Check if we have any security warnings
  const hasWarnings = securityResults.some(result => !result.passed);
  
  // Don't show the banner if not connected or user dismissed it
  if (!connected || !showBanner) {
    return null;
  }
  
  return (
    <Alert 
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-lg animate-in slide-in-from-bottom-4 ${
        hasWarnings ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          {hasWarnings ? (
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-green-600" />
          )}
        </div>
        
        <AlertDescription className="text-sm flex-1">
          <div className="font-medium mb-1">
            {hasWarnings 
              ? 'Wallet Security Warning' 
              : 'Wallet Connection Secure'}
          </div>
          
          <div className="text-xs space-y-1 mb-2">
            {hasWarnings ? (
              <>
                {securityResults.filter(r => !r.passed).map((result, idx) => (
                  <div key={idx}>
                    {result.warnings.map((warning, i) => (
                      <p key={i} className="text-amber-700">{warning}</p>
                    ))}
                  </div>
                ))}
              </>
            ) : (
              <p className="text-green-700">
                Your wallet connection is secure. Always verify transaction details before signing.
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-xs ${hasWarnings ? 'border-amber-300 text-amber-700' : 'border-green-300 text-green-700'}`}
              onClick={() => setShowBanner(false)}
            >
              Dismiss
            </Button>
            
            <a
              href="https://metamask.io/security/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center gap-1 text-xs ${hasWarnings ? 'text-amber-700' : 'text-green-700'}`}
            >
              <Info className="h-3 w-3" />
              Security Tips
            </a>
          </div>
        </AlertDescription>
        
        <button 
          onClick={() => setShowBanner(false)} 
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
};

export default WalletSecurityBanner;
