
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash, Download } from 'lucide-react';
import { toast } from 'sonner';

interface WebhookLog {
  id: string;
  timestamp: string;
  type: string;
  url: string;
  request: any;
  response?: any;
  error?: string;
  status?: number;
  environment?: string;
}

const WebhookLogTab: React.FC = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);

  useEffect(() => {
    // Load logs from localStorage
    const storedLogs = localStorage.getItem('webhookLogs');
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch (error) {
        console.error('Error parsing webhook logs:', error);
      }
    }

    // Set up event listener for new webhook logs
    const handleNewLog = (event: CustomEvent) => {
      const newLog = event.detail;
      setLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs].slice(0, 50); // Keep last 50 logs
        localStorage.setItem('webhookLogs', JSON.stringify(updatedLogs));
        return updatedLogs;
      });
    };

    window.addEventListener('webhook-log' as any, handleNewLog as EventListener);

    return () => {
      window.removeEventListener('webhook-log' as any, handleNewLog as EventListener);
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('webhookLogs');
    toast.success('Webhook logs cleared');
  };

  const downloadLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `webhook-logs-${new Date().toISOString()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Webhook logs downloaded');
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-medium">Webhook Activity</h3>
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={downloadLogs}
            disabled={logs.length === 0}
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={clearLogs}
            disabled={logs.length === 0}
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-6 text-xs text-gray-500">
          No webhook activity logged yet
        </div>
      ) : (
        <ScrollArea className="h-[200px] w-full border rounded-md">
          <div className="p-2 space-y-2">
            {logs.map((log) => (
              <details key={log.id} className="text-[10px] bg-gray-50 p-2 rounded-md">
                <summary className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-1">
                    <span 
                      className={`inline-block w-2 h-2 rounded-full ${
                        log.error ? 'bg-red-500' : 
                        (log.status && log.status >= 200 && log.status < 300) ? 'bg-green-500' : 'bg-amber-500'
                      }`}
                    />
                    <span className="font-medium">{log.type}</span>
                    {log.environment && (
                      <span className={`text-[8px] px-1 py-0.5 rounded ${
                        log.environment === 'production' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.environment === 'production' ? 'PROD' : 'DEV'}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </summary>

                <div className="mt-2 space-y-1">
                  <div>
                    <span className="font-medium">URL:</span>
                    <code className="block mt-0.5 break-all bg-gray-100 p-0.5 rounded text-[8px]">{log.url}</code>
                  </div>
                  
                  <div>
                    <span className="font-medium">Request:</span>
                    <pre className="block mt-0.5 overflow-x-auto bg-gray-100 p-0.5 rounded text-[8px] max-h-[50px]">
                      {JSON.stringify(log.request, null, 2)}
                    </pre>
                  </div>
                  
                  {log.response && (
                    <div>
                      <span className="font-medium">Response:</span>
                      <pre className="block mt-0.5 overflow-x-auto bg-gray-100 p-0.5 rounded text-[8px] max-h-[50px]">
                        {JSON.stringify(log.response, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {log.error && (
                    <div>
                      <span className="font-medium text-red-500">Error:</span>
                      <pre className="block mt-0.5 overflow-x-auto bg-red-50 text-red-800 p-0.5 rounded text-[8px] max-h-[50px]">
                        {log.error}
                      </pre>
                    </div>
                  )}
                  
                  {log.status && (
                    <div>
                      <span className="font-medium">Status:</span>
                      <span 
                        className={`ml-1 ${
                          log.status >= 200 && log.status < 300 ? 'text-green-600' : 
                          log.status >= 400 ? 'text-red-600' : 'text-amber-600'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default WebhookLogTab;
