
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { WebhookLog } from '@/types/webhook';

const WebhookLogTab: React.FC = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  
  // Load webhook logs from localStorage
  const loadLogs = () => {
    try {
      const storedLogs = localStorage.getItem('webhookLogs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        setLogs(Array.isArray(parsedLogs) ? parsedLogs : []);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Error loading webhook logs from localStorage:', err);
      setLogs([]);
    }
  };
  
  // Clear all webhook logs
  const clearLogs = () => {
    localStorage.setItem('webhookLogs', JSON.stringify([]));
    setLogs([]);
    toast.success('Webhook logs cleared');
  };
  
  // Load logs on component mount and when a new log is added
  useEffect(() => {
    loadLogs();
    
    // Listen for webhook-log events
    const handleWebhookLog = () => {
      loadLogs();
    };
    
    window.addEventListener('webhook-log', handleWebhookLog);
    
    return () => {
      window.removeEventListener('webhook-log', handleWebhookLog);
    };
  }, []);
  
  // Toggle expanded view for a log
  const toggleLogExpand = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString();
    } catch (e) {
      return dateString;
    }
  };
  
  // Get status color class
  const getStatusColor = (status?: number) => {
    if (!status) return 'text-gray-600';
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400) return 'text-red-600';
    return 'text-yellow-600';
  };

  // Get method color class
  const getMethodColor = (method?: string) => {
    if (!method) return 'bg-gray-500';
    switch (method.toUpperCase()) {
      case 'POST': return 'bg-green-600';
      case 'GET': return 'bg-blue-600';
      case 'PUT': return 'bg-yellow-600'; 
      case 'DELETE': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  // Filter out pushlogs to grafana from logging view
  // Added null check for url property
  const filteredLogs = logs.filter(log => log.url && typeof log.url === 'string' && !log.url.includes('pushLogsToGrafana'));
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-medium">API/Webhook Logs</h4>
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-xs px-2"
            onClick={loadLogs}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-xs px-2"
            onClick={clearLogs}
          >
            <Trash className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto space-y-2 bg-gray-50 rounded p-1 text-xs">
        {filteredLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-xs">No logs available</p>
        ) : (
          filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="border border-gray-200 rounded bg-white p-1.5 text-[10px] space-y-1 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => toggleLogExpand(log.id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  {log.method && (
                    <span className={`text-[8px] font-semibold text-white px-1.5 py-0.5 rounded ${getMethodColor(log.method)}`}>
                      {log.method.toUpperCase()}
                    </span>
                  )}
                  <span className={`font-semibold ${log.type === 'Reading' ? 'text-purple-600' : log.type === 'Login' ? 'text-blue-600' : log.type === 'Deck' ? 'text-amber-600' : 'text-gray-600'}`}>
                    {log.type}
                  </span>
                </div>
                <span className="text-gray-500">{formatDate(log.timestamp)}</span>
              </div>
              
              <div className="truncate">
                <span className="text-gray-600">URL:</span> <span className="font-mono overflow-ellipsis">{log.url || 'N/A'}</span>
              </div>
              
              {log.status && (
                <div>
                  <span className="text-gray-600">Status:</span> <span className={getStatusColor(log.status)}>{log.status}</span>
                </div>
              )}
              
              {log.error && (
                <div className="text-red-500">
                  <span>Error: {log.error}</span>
                </div>
              )}
              
              {log.environment && (
                <div className="text-xs">
                  <span className="text-gray-600">Env:</span> <span className={log.environment === 'production' ? 'text-green-600' : 'text-amber-600'}>{log.environment}</span>
                </div>
              )}

              {(expandedLogId === log.id || log.error) && (
                <div className="mt-1 space-y-1 pl-2 border-l-2 border-gray-200">
                  <div>
                    <div className="font-medium">Request:</div>
                    <pre className="overflow-x-auto bg-gray-50 p-1 rounded text-[8px] max-h-20">{JSON.stringify(log.request, null, 2)}</pre>
                  </div>
                  
                  {log.response && (
                    <div>
                      <div className="font-medium">Response:</div>
                      <pre className="overflow-x-auto bg-gray-50 p-1 rounded text-[8px] max-h-20">{JSON.stringify(log.response, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
              
              {expandedLogId !== log.id && !log.error && (
                <div className="text-center text-blue-500 text-[9px]">
                  Click to show details <ExternalLink className="inline h-2 w-2" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WebhookLogTab;
