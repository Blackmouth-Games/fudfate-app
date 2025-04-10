
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash, Download, Maximize2, Minimize2, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const [expanded, setExpanded] = useState(false);

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
    const handleNewLog = (event: CustomEvent<WebhookLog>) => {
      const newLog = event.detail;
      setLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs].slice(0, 50); // Keep last 50 logs
        localStorage.setItem('webhookLogs', JSON.stringify(updatedLogs));
        return updatedLogs;
      });
    };

    window.addEventListener('webhook-log', handleNewLog as EventListener);

    return () => {
      window.removeEventListener('webhook-log', handleNewLog as EventListener);
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('webhookLogs');
    toast.success('Webhook logs cleared');
  };

  const refreshLogs = () => {
    const storedLogs = localStorage.getItem('webhookLogs');
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
        toast.success('Logs refreshed');
      } catch (error) {
        console.error('Error parsing webhook logs:', error);
        toast.error('Error refreshing logs');
      }
    }
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
            onClick={refreshLogs}
            title="Refresh Logs"
          >
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={downloadLogs}
            disabled={logs.length === 0}
            title="Download Logs"
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={clearLogs}
            disabled={logs.length === 0}
            title="Clear Logs"
          >
            <Trash className="h-3 w-3" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                title="Expanded View"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Webhook Logs</DialogTitle>
              </DialogHeader>
              <div className="flex justify-end gap-1 mb-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshLogs}
                >
                  <RotateCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadLogs}
                  disabled={logs.length === 0}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearLogs}
                  disabled={logs.length === 0}
                >
                  <Trash className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
              <ScrollArea className="flex-1 border rounded-md overflow-hidden">
                <div className="p-3 space-y-3">
                  {logs.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-500">
                      No webhook activity logged yet
                    </div>
                  ) : (
                    logs.map((log) => (
                      <details key={log.id} className="text-xs bg-gray-50 p-3 rounded-md">
                        <summary className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span 
                              className={`inline-block w-2 h-2 rounded-full ${
                                log.error ? 'bg-red-500' : 
                                (log.status && log.status >= 200 && log.status < 300) ? 'bg-green-500' : 'bg-amber-500'
                              }`}
                            />
                            <span className="font-medium">{log.type}</span>
                            {log.environment && (
                              <span className={`text-[9px] px-1 py-0.5 rounded ${
                                log.environment === 'production' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {log.environment === 'production' ? 'PROD' : 'DEV'}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </summary>

                        <div className="mt-2 space-y-2">
                          <div>
                            <span className="font-medium">URL:</span>
                            <code className="block mt-0.5 break-all bg-gray-100 p-1 rounded text-[10px]">{log.url}</code>
                          </div>
                          
                          <div>
                            <span className="font-medium">Request:</span>
                            <pre className="block mt-0.5 overflow-x-auto bg-gray-100 p-1 rounded text-[10px] max-h-[100px]">
                              {JSON.stringify(log.request, null, 2)}
                            </pre>
                          </div>
                          
                          {log.response && (
                            <div>
                              <span className="font-medium">Response:</span>
                              <pre className="block mt-0.5 overflow-x-auto bg-gray-100 p-1 rounded text-[10px] max-h-[100px]">
                                {JSON.stringify(log.response, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {log.error && (
                            <div>
                              <span className="font-medium text-red-500">Error:</span>
                              <pre className="block mt-0.5 overflow-x-auto bg-red-50 text-red-800 p-1 rounded text-[10px] max-h-[100px]">
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
                    ))
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-6 text-xs text-gray-500">
          No webhook activity logged yet
        </div>
      ) : (
        <ScrollArea className={`${expanded ? 'h-[400px]' : 'h-[200px]'} w-full border rounded-md`}>
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
      {logs.length > 0 && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs px-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <Minimize2 className="h-3 w-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <Maximize2 className="h-3 w-3 mr-1" />
                Show More
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WebhookLogTab;
