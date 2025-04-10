
import { useState } from 'react';
import { ConnectionLog } from '@/types/walletTypes';

export const useConnectionLogs = () => {
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>(() => {
    // Try to load logs from localStorage on initialization
    try {
      const savedLogs = localStorage.getItem('connectionLogs');
      return savedLogs ? JSON.parse(savedLogs) : [];
    } catch (e) {
      console.error('Error loading connection logs from localStorage:', e);
      return [];
    }
  });
  
  const addConnectionLog = (action: string, details: string) => {
    const newLog = {
      timestamp: new Date().toISOString(),
      action,
      details
    };
    
    console.log(`Connection Log: [${action}] ${details}`);
    
    setConnectionLogs(prev => {
      const newLogs = [newLog, ...prev];
      // Limit to 50 logs
      const trimmedLogs = newLogs.slice(0, 50);
      
      // Store in localStorage
      try {
        localStorage.setItem('connectionLogs', JSON.stringify(trimmedLogs));
      } catch (e) {
        console.error('Error saving connection logs to localStorage:', e);
      }
      
      return trimmedLogs;
    });
  };

  const clearLogs = () => {
    setConnectionLogs([]);
    try {
      localStorage.removeItem('connectionLogs');
    } catch (e) {
      console.error('Error clearing connection logs from localStorage:', e);
    }
  };

  return {
    connectionLogs,
    addConnectionLog,
    clearLogs
  };
};
