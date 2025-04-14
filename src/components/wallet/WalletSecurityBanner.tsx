
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkConnectionSecurity } from '@/utils/wallet-security';
import { getShortWalletAddress } from '@/utils/wallet-connection-utils';
import { useWallet } from '@/contexts/WalletContext';
import { useTranslation } from 'react-i18next';

const WalletSecurityBanner = () => {
  const { t } = useTranslation();
  const { connected, walletAddress } = useWallet();
  const [securityStatus, setSecurityStatus] = useState({
    secure: true,
    message: '',
    details: ''
  });
  const [show, setShow] = useState(false);

  // Auto-hide timeout in milliseconds (5-7 seconds)
  const autoHideTimeout = 6000; // 6 seconds

  useEffect(() => {
    if (connected && walletAddress) {
      const status = checkConnectionSecurity(walletAddress);
      setSecurityStatus(status);
      
      if (!status.secure) {
        setShow(true);
        
        // Auto-hide banner after specified seconds
        const timer = setTimeout(() => {
          setShow(false);
        }, autoHideTimeout);
        
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [connected, walletAddress]);

  if (!connected || securityStatus.secure) {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <Alert className="mx-auto max-w-4xl border border-red-300 bg-red-50">
            <div className="flex justify-between">
              <div>
                <AlertTitle className="text-red-700 flex items-center gap-2">
                  {t('wallet.securityWarning')}
                </AlertTitle>
                <AlertDescription className="text-red-600">
                  <p className="mb-1">
                    {securityStatus.message} ({getShortWalletAddress(walletAddress)})
                  </p>
                  <p className="text-xs text-red-500">{securityStatus.details}</p>
                </AlertDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShow(false)}
                className="h-6 w-6 p-0 rounded-full text-red-700 hover:text-red-900 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WalletSecurityBanner;
