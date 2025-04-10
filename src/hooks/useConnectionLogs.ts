
import { useState } from 'react';
import { ConnectionLog } from '@/types/walletTypes';

export const useConnectionLogs = () => {
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([]);
  
  const addConnectionLog = (action: string, details: string) => {
    setConnectionLogs(prev => {
      const newLogs = [
        {
          timestamp: new Date().toISOString(),
          action,
          details
        },
        ...prev
      ];
      
      return newLogs.slice(0, 50);
    });
  };

  const clearLogs = () => {
    setConnectionLogs([]);
  };

  return {
    connectionLogs,
    logs: connectionLogs, // Add an alias for backward compatibility
    addConnectionLog,
    clearLogs // Add the new clearLogs function
  };
};
