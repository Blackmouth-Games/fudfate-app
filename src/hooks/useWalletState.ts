
import { useEffect } from 'react';
import { UserData, WalletType } from '@/types/walletTypes';

export const useWalletState = (
  setWalletAddress: (address: string | null) => void,
  setWalletType: (type: WalletType) => void,
  setNetwork: (network: string | null) => void,
  setUserData: (data: UserData | null) => void,
  addConnectionLog: (action: string, details: string) => void
) => {
  useEffect(() => {
    const savedWalletAddress = localStorage.getItem('walletAddress');
    const savedWalletType = localStorage.getItem('walletType');
    const savedNetwork = localStorage.getItem('network');
    const savedUserData = localStorage.getItem('userData');
    
    if (savedWalletAddress && savedWalletType) {
      setWalletAddress(savedWalletAddress);
      setWalletType(savedWalletType as WalletType);
      setNetwork(savedNetwork);
      
      if (savedUserData) {
        try {
          setUserData(JSON.parse(savedUserData));
        } catch (error) {
          console.error("Error parsing saved user data:", error);
        }
      }
      
      addConnectionLog('Restore Session', `Restored wallet session: ${savedWalletType}, ${savedWalletAddress}`);
    }
  }, [setWalletAddress, setWalletType, setNetwork, setUserData, addConnectionLog]);
};
