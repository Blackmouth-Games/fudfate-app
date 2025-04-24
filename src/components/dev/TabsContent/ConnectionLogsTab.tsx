import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useConnectionLogs } from '@/hooks/useConnectionLogs';

const ConnectionLogsTab = () => {
  const { logs, clearLogs } = useConnectionLogs();
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

  const handleClearLogs = () => {
    clearLogs();
    toast.success('Connection logs cleared');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearLogs}
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
