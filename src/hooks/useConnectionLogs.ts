import { ConnectionLog } from '@/types/walletTypes';

export const useConnectionLogs = () => {
  const addConnectionLog = (action: string, details: string) => {
    // Disabled connection logging
    return;
  };

  const clearLogs = () => {
    // Disabled connection logging
    return;
  };

  return {
    connectionLogs: [],
    addConnectionLog,
    clearLogs
  };
};
