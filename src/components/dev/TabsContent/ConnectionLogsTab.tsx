
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash, Download, Maximize2, Minimize2, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { ConnectionLog } from '@/types/walletTypes';
import { useWallet } from '@/contexts/WalletContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ConnectionLogsTab: React.FC = () => {
  const { connectionLogs } = useWallet();
  const [expanded, setExpanded] = useState(false);

  const downloadLogs = () => {
    const dataStr = JSON.stringify(connectionLogs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `connection-logs-${new Date().toISOString()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Connection logs downloaded');
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (error) {
      return 'Invalid time';
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('Error') || action.includes('Failed')) return 'text-red-600';
    if (action.includes('Success') || action.includes('Connected')) return 'text-green-600';
    if (action.includes('Attempt') || action.includes('Connecting')) return 'text-amber-600';
    return 'text-blue-600';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Error') || action.includes('Failed')) return '❌';
    if (action.includes('Success') || action.includes('Connected')) return '✅';
    if (action.includes('Attempt') || action.includes('Connecting')) return '⏳';
    if (action.includes('Disconnect')) return '🔌';
    return '🔄';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-medium">Connection Activity</h3>
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={downloadLogs}
            disabled={connectionLogs.length === 0}
            title="Download Logs"
          >
            <Download className="h-3 w-3" />
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
                <DialogTitle>Connection Logs</DialogTitle>
              </DialogHeader>
              <div className="flex justify-end gap-1 mb-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadLogs}
                  disabled={connectionLogs.length === 0}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
              <ScrollArea className="flex-1 border rounded-md overflow-hidden">
                <div className="p-3">
                  {connectionLogs.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-500">
                      No connection activity logged yet
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Time</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Action</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {connectionLogs.map((log, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                              {formatTime(log.timestamp)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`font-medium ${getActionColor(log.action)}`}>
                                {getActionIcon(log.action)} {log.action}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              <code className="text-[11px] bg-gray-50 px-1 py-0.5 rounded">
                                {log.details}
                              </code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {connectionLogs.length === 0 ? (
        <div className="text-center py-6 text-xs text-gray-500">
          No connection activity logged yet
        </div>
      ) : (
        <ScrollArea className={`${expanded ? 'h-[400px]' : 'h-[200px]'} w-full border rounded-md`}>
          <div className="p-2 space-y-2">
            {connectionLogs.map((log, index) => (
              <div key={index} className="text-[10px] bg-gray-50 p-2 rounded-md">
                <div className="flex justify-between items-start">
                  <span className={`font-medium ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)} {log.action}
                  </span>
                  <span className="text-gray-500 text-[9px]">{formatTime(log.timestamp)}</span>
                </div>
                <div className="mt-1">
                  <pre className="text-[9px] bg-gray-100 p-1 rounded overflow-x-auto whitespace-pre-wrap break-words">
                    {log.details}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      {connectionLogs.length > 0 && (
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

export default ConnectionLogsTab;
