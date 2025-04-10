
import { useState } from 'react';
import { UserData } from '@/types/walletTypes';

/**
 * Hook to manage wallet storage in localStorage
 */
export const useWalletStorage = () => {
  // Save wallet data to localStorage
  const saveWalletData = (address: string, type: string, network: string | null) => {
    localStorage.setItem('walletAddress', address);
    localStorage.setItem('walletType', type);
    if (network) {
      localStorage.setItem('network', network);
    }
  };
  
  // Clear wallet data from localStorage
  const clearWalletData = () => {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
    localStorage.removeItem('network');
    localStorage.removeItem('userData');
  };
  
  // Save user data to localStorage
  const saveUserData = (data: UserData) => {
    localStorage.setItem('userData', JSON.stringify(data));
  };
  
  return {
    saveWalletData,
    clearWalletData,
    saveUserData
  };
};
