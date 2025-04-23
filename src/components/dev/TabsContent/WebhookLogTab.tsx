import { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, ChevronDown, ChevronRight, Maximize2, Minimize2, GripHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Resizable } from 're-resizable';
import { WebhookLog } from '@/types/webhook';

// Key for localStorage
const WEBHOOK_LOGS_KEY = 'webhook_logs';
const WEBHOOK_LOG_EVENT = 'webhook-log';

const WebhookLogTab = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [sectionHeights, setSectionHeights] = useState<Record<string, number>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load logs from localStorage
  const loadLogsFromStorage = useCallback(() => {
    try {
      console.log('WebhookLogTab: Loading logs from storage');
      const storedLogs = localStorage.getItem(WEBHOOK_LOGS_KEY);
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        console.log(`WebhookLogTab: Found ${parsedLogs.length} logs in storage`);
        setLogs(parsedLogs);
      } else {
        console.log('WebhookLogTab: No logs found in storage');
      }
    } catch (error) {
      console.error('WebhookLogTab: Error loading logs from storage:', error);
    }
  }, []);

  // Handle new webhook log events
  const handleNewLog = useCallback((event: CustomEvent<WebhookLog>) => {
    console.log('WebhookLogTab: Received new log event:', event.detail);
    setLogs(prevLogs => {
      const newLog = event.detail;
      // Ensure we don't add duplicate logs
      const exists = prevLogs.some(log => log.id === newLog.id);
      if (exists) {
        console.log('WebhookLogTab: Duplicate log detected, skipping');
        return prevLogs;
      }
      console.log('WebhookLogTab: Adding new log to state');
      return [newLog, ...prevLogs].slice(0, 100);
    });
  }, []);

  // Initial load and event listener setup
  useEffect(() => {
    console.log('WebhookLogTab: Component mounted');
    loadLogsFromStorage();

    // Add event listener for new logs
    window.addEventListener(WEBHOOK_LOG_EVENT, handleNewLog as EventListener);
    console.log('WebhookLogTab: Added event listener for webhook logs');

    // Set up storage event listener for cross-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WEBHOOK_LOGS_KEY) {
        console.log('WebhookLogTab: Storage change detected, reloading logs');
        loadLogsFromStorage();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      console.log('WebhookLogTab: Component unmounting, removing event listeners');
      window.removeEventListener(WEBHOOK_LOG_EVENT, handleNewLog as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadLogsFromStorage, handleNewLog]);

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem(WEBHOOK_LOGS_KEY);
    toast.success('Webhook logs cleared');
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

  const toggleLogExpansion = (index: number) => {
    setExpandedLogs(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      return newExpanded;
    });
  };

  const toggleSection = (logIndex: number, section: string) => {
    const key = `${logIndex}-${section}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleResizeStop = (key: string, height: number) => {
    setSectionHeights(prev => ({
      ...prev,
      [key]: height
    }));
  };

  const renderJsonSection = (title: string, data: any, logIndex: number) => {
    if (!data) return null;
    const sectionKey = `${logIndex}-${title.toLowerCase()}`;
    const isExpanded = expandedSections[sectionKey];
    const currentHeight = sectionHeights[sectionKey] || 200;

    return (
      <div className="space-y-1">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
          onClick={() => toggleSection(logIndex, title.toLowerCase())}
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <div className="text-xs font-medium text-gray-600">{title}</div>
        </div>
        {isExpanded && (
          <div className="relative">
            <Resizable
              size={{ width: '100%', height: currentHeight }}
              onResizeStop={(e, direction, ref, d) => {
                handleResizeStop(sectionKey, currentHeight + d.height);
              }}
              enable={{ bottom: true }}
              handleComponent={{
                bottom: (
                  <div className="absolute bottom-0 left-0 right-0 h-2 cursor-row-resize flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <GripHorizontal className="h-3 w-3 text-gray-400" />
                  </div>
                )
              }}
              handleStyles={{
                bottom: {
                  bottom: '-4px',
                  height: '8px'
                }
              }}
              className="relative"
            >
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto h-full border border-gray-200">
                {formatJson(data)}
              </pre>
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-1 hover:bg-gray-200"
                  onClick={() => {
                    const newHeight = currentHeight === 400 ? 200 : 400;
                    handleResizeStop(sectionKey, newHeight);
                  }}
                >
                  {currentHeight > 200 ? 
                    <Minimize2 className="h-3 w-3" /> : 
                    <Maximize2 className="h-3 w-3" />
                  }
                </Button>
              </div>
            </Resizable>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
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
            onClick={loadLogsFromStorage}
            className="h-7 text-xs flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
        <Badge variant="outline" className="text-xs">
          {logs.length} requests
        </Badge>
      </div>

      <ScrollArea className="flex-grow">
        <div className="space-y-2 p-4">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              No webhook logs yet
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={log.id || index}
                className="border rounded-lg overflow-hidden bg-white shadow-sm"
              >
                <div
                  className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleLogExpansion(index)}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-5">
                      {log.type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    {log.status && (
                      <Badge 
                        variant={log.status >= 200 && log.status < 300 ? "default" : "destructive"}
                        className="text-[10px] h-5"
                      >
                        {log.status}
                      </Badge>
                    )}
                    {log.error && (
                      <Badge variant="destructive" className="text-[10px] h-5">
                        Error
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-5">
                      {log.environment}
                    </Badge>
                    {expandedLogs.has(index) ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedLogs.has(index) && (
                  <div className="p-2 border-t space-y-2 bg-gray-50">
                    <div className="text-xs font-mono break-all bg-white p-2 rounded border border-gray-200">
                      {log.method} {log.url}
                    </div>
                    {renderJsonSection('Request', log.request, index)}
                    {renderJsonSection('Response', log.response, index)}
                    {log.error && renderJsonSection('Error', { message: log.error }, index)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default WebhookLogTab;
