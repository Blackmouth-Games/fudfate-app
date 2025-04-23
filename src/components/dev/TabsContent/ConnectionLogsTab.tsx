import React, { useState, useCallback, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface ConnectionLog {
  type: string;
  message: string;
  timestamp: string;
  details?: any;
}

// Key for localStorage
const CONNECTION_LOGS_KEY = 'connectionLogs';
const CONNECTION_LOG_EVENT = 'connection-log';

const ConnectionLogsTab = () => {
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  // Load logs from localStorage
  const loadLogsFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(CONNECTION_LOGS_KEY);
      if (stored) {
        setLogs(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading connection logs from localStorage:', e);
    }
  }, []);

  // Handle new log events
  const handleNewLog = useCallback((event: CustomEvent<ConnectionLog>) => {
    const newLog = event.detail;
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  // Initial load and event listeners
  useEffect(() => {
    loadLogsFromStorage();

    window.addEventListener(CONNECTION_LOG_EVENT, handleNewLog as EventListener);
    const storageListener = (e: StorageEvent) => {
      if (e.key === CONNECTION_LOGS_KEY) {
        loadLogsFromStorage();
      }
    };
    window.addEventListener('storage', storageListener);

    return () => {
      window.removeEventListener(CONNECTION_LOG_EVENT, handleNewLog as EventListener);
      window.removeEventListener('storage', storageListener);
    };
  }, [loadLogsFromStorage, handleNewLog]);

  const toggleLogExpansion = (index: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  const clearLogs = () => {
    setLogs([]);
    try {
      localStorage.removeItem(CONNECTION_LOGS_KEY);
    } catch (e) {
      console.error('Error clearing connection logs from localStorage:', e);
    }
    toast.success('Connection logs cleared');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  // Expose addLog globally and dispatch event
  const addLog = useCallback((log: ConnectionLog) => {
    setLogs(prev => {
      const updated = [log, ...prev].slice(0, 50);
      try {
        localStorage.setItem(CONNECTION_LOGS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving connection logs to localStorage:', e);
      }
      return updated;
    });

    try {
      const evt = new CustomEvent(CONNECTION_LOG_EVENT, { detail: log });
      window.dispatchEvent(evt);
    } catch (e) {
      /* noop */
    }
  }, []);

  // Register global only once
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.addConnectionLog = addLog;
    }
  }, [addLog]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearLogs}
            className="h-7 text-xs flex items-center gap-1 bg-white"
          >
            <Trash2 className="h-3 w-3" />
            Clear Logs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="h-7 text-xs flex items-center gap-1 bg-white"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
        <Badge variant="outline" className="text-xs bg-white px-2 py-1">
          {logs.length} events
        </Badge>
      </div>

      <ScrollArea className="flex-grow">
        <div className="space-y-1 p-2">
          {logs.map((log, index) => {
            const isError = log.type === 'error' || log.message.toLowerCase().includes('error') || log.message.toLowerCase().includes('failed');
            const isSuccess = log.message.toLowerCase().includes('success') || log.type.toLowerCase().includes('success');
            const isWarning = log.message.toLowerCase().includes('warning') || log.type.toLowerCase().includes('warning');
            
            let badgeVariant: "default" | "secondary" | "destructive" | "outline" = 'secondary';
            if (isError) badgeVariant = 'destructive';
            else if (isSuccess) badgeVariant = 'default';
            else if (isWarning) badgeVariant = 'outline';

            return (
              <div
                key={index}
                className="border rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleLogExpansion(index)}
                >
                  <Badge
                    variant={badgeVariant}
                    className="h-5 min-w-[80px] flex items-center justify-center text-[10px] font-medium"
                  >
                    {log.type}
                  </Badge>
                  <div className="flex-grow text-xs font-medium text-gray-700">
                    {log.message}
                  </div>
                  <div className="text-[10px] text-gray-400 tabular-nums font-mono">
                    {formatTimestamp(log.timestamp)}
                  </div>
                  {log.details && (
                    <ChevronDown 
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                        expandedLogs.has(index) ? 'rotate-180' : ''
                      }`} 
                    />
                  )}
                </div>

                {expandedLogs.has(index) && log.details && (
                  <div className="border-t bg-gray-50">
                    <pre className="text-[11px] leading-5 font-mono p-3 overflow-auto max-h-[400px] text-gray-700">
                      {formatJson(log.details)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}

          {logs.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-12 select-none">
              <div className="mb-2 opacity-50">📝</div>
              No connection logs yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConnectionLogsTab;
