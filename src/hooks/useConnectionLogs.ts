import { useState, useCallback, useEffect } from 'react';
import { ConnectionLog } from '@/types/walletTypes';

const CONNECTION_LOGS_KEY = 'connectionLogs';
const CONNECTION_LOG_EVENT = 'connection-log';

export const useConnectionLogs = () => {
  const [logs, setLogs] = useState<ConnectionLog[]>([]);

  // Load initial logs
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONNECTION_LOGS_KEY);
      if (stored) {
        setLogs(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading connection logs:', e);
    }
  }, []);

  const addConnectionLog = useCallback((type: string, message: string, details?: any) => {
    const newLog: ConnectionLog = {
      timestamp: new Date().toISOString(),
      type,
      message,
      details
    };

    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 50);
      try {
        localStorage.setItem(CONNECTION_LOGS_KEY, JSON.stringify(updated));
        const event = new CustomEvent(CONNECTION_LOG_EVENT, { detail: newLog });
        window.dispatchEvent(event);
      } catch (e) {
        console.error('Error saving connection logs:', e);
      }
      return updated;
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    try {
      localStorage.removeItem(CONNECTION_LOGS_KEY);
    } catch (e) {
      console.error('Error clearing connection logs:', e);
    }
  }, []);

  return {
    logs,
    addConnectionLog,
    clearLogs
  };
};
