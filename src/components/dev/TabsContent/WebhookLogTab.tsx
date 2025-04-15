import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, ChevronDown, ChevronRight, Maximize2, Minimize2, GripHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Resizable } from 're-resizable';

interface WebhookLog {
  type: string;
  url: string;
  timestamp: string;
  status?: number;
  error?: string;
  request?: any;
  response?: any;
}

const WebhookLogTab = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [sectionHeights, setSectionHeights] = useState<Record<string, number>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleLogExpansion = (index: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  const toggleSection = (logIndex: number, section: string) => {
    const key = `${logIndex}-${section}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const clearLogs = () => {
    setLogs([]);
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

  const addLog = (log: WebhookLog) => {
    setLogs(prev => [log, ...prev]);
  };

  // Expose addLog function globally
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.addWebhookLog = addLog;
  }

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
              <div className="absolute top-1 right-1">
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
            onClick={() => window.location.reload()}
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
                  variant={log.error ? 'destructive' : 'default'}
                  className="h-5 min-w-[60px] flex items-center justify-center"
                >
                  {log.type}
                </Badge>
                <div className="flex-grow text-xs truncate font-mono">
                  {new URL(log.url).pathname}
                </div>
                <Badge
                  variant={log.error ? 'destructive' : (log.status === 200 ? 'default' : 'secondary')}
                  className="h-5 min-w-[40px] flex items-center justify-center"
                >
                  {log.status || 'ERR'}
                </Badge>
                <div className="text-xs text-gray-500">
                  {formatTimestamp(log.timestamp)}
                </div>
              </div>

              {expandedLogs.has(index) && (
                <div className="border-t p-2 space-y-2">
                  {log.error && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-red-600">Error</div>
                      <pre className="text-xs bg-red-50 p-2 rounded overflow-auto">
                        {log.error}
                      </pre>
                    </div>
                  )}

                  {renderJsonSection('Request', log.request, index)}
                  {renderJsonSection('Response', log.response, index)}
                </div>
              )}
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">
              No webhook logs yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default WebhookLogTab;
