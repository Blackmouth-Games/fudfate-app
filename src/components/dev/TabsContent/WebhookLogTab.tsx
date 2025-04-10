
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { WebhookLog } from '@/services/webhook-service';

const WebhookLogTab: React.FC = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  
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
      console.error('Error loading webhook logs:', err);
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
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-xs">No logs available</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="border border-gray-200 rounded bg-white p-1.5 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span className={`font-semibold ${log.type === 'Reading' ? 'text-purple-600' : log.type === 'Login' ? 'text-blue-600' : log.type === 'Deck' ? 'text-amber-600' : 'text-gray-600'}`}>
                  {log.type}
                </span>
                <span className="text-gray-500">{formatDate(log.timestamp)}</span>
              </div>
              
              <div className="truncate">
                <span className="text-gray-600">URL:</span> <span className="font-mono overflow-ellipsis">{log.url}</span>
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
              
              <details>
                <summary className="cursor-pointer text-blue-500 hover:text-blue-700">Details</summary>
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
              </details>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WebhookLogTab;
