import React, { useState } from 'react';
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

const ConnectionLogsTab = () => {
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

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

  const addLog = (log: ConnectionLog) => {
    setLogs(prev => [log, ...prev]);
  };

  // Expose addLog function globally
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.addConnectionLog = addLog;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearLogs}
            className="h-7 text-xs flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Clear Logs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="h-7 text-xs flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
        <Badge variant="outline" className="text-xs">
          {logs.length} events
        </Badge>
      </div>

      <ScrollArea className="flex-grow">
        <div className="space-y-2 p-4">
          {logs.map((log, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden bg-white shadow-sm"
            >
              <div
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleLogExpansion(index)}
              >
                <Badge
                  variant={log.type === 'error' ? 'destructive' : 'default'}
                  className="h-5 min-w-[60px] flex items-center justify-center"
                >
                  {log.type}
                </Badge>
                <div className="flex-grow text-xs truncate">
                  {log.message}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTimestamp(log.timestamp)}
                </div>
                {log.details && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    expandedLogs.has(index) ? 'rotate-180' : ''
                  }`} />
                )}
              </div>

              {expandedLogs.has(index) && log.details && (
                <div className="border-t p-2">
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-[400px]">
                    {formatJson(log.details)}
                  </pre>
                </div>
              )}
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">
              No connection logs yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConnectionLogsTab;
