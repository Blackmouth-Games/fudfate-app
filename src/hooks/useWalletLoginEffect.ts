import { useEffect, useRef } from 'react';
import { useWalletContext } from '@/contexts/WalletContext';
import { useUserContext } from '@/contexts/UserContext';
import { useEnvironment } from '@/hooks/useEnvironment';
import { parseUserData } from '@/utils/wallet-connection-utils';
import { logLoginWebhook } from '@/services/webhook/logger';

export function useWalletLoginEffect() {
  const { connected, walletAddress, walletType } = useWalletContext();
  const { setUserData } = useUserContext();
  const { webhooks, environment } = useEnvironment();
  const hasRunRef = useRef<string | null>(null);

  useEffect(() => {
    const doLogin = async () => {
      if (connected && walletAddress && walletType && hasRunRef.current !== walletAddress) {
        hasRunRef.current = walletAddress;
        try {
          // 1. LOGIN
          const loginResponse = await fetch(webhooks.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: walletAddress, type: walletType }),
          });
          const loginData = await loginResponse.json();
          const user = parseUserData(loginData);
          logLoginWebhook(
            {
              url: webhooks.login,
              data: { wallet: walletAddress, type: walletType },
              environment
            },
            {
              data: loginData,
              status: loginResponse.status
            }
          );
          if (!user) return;
          setUserData(user);
        } catch (err) {
          console.error('Error in login webhook:', err);
        }
      }
      // Si la wallet se desconecta, resetea el ref
      if (!connected) {
        hasRunRef.current = null;
      }
    };
    doLogin();
  }, [connected, walletAddress, walletType, webhooks.login, setUserData, environment]);
} 