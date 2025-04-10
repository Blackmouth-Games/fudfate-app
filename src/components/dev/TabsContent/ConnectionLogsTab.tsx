
import React, { useState, useEffect, useRef } from 'react';
import { useConnectionLogs } from '@/hooks/useConnectionLogs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Maximize2, Download, RefreshCw, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ConnectionLogsTab = () => {
  const { logs, clearLogs } = useConnectionLogs();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    connect: true,
    disconnect: true,
    login: true,
    error: true,
    other: true
  });
  
  // Ref for the logs container, used for scrolling
  const logsContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);
  
  // Function to download logs as JSON
  const handleDownloadLogs = () => {
    const filteredLogs = applyFilters(logs);
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `wallet-connection-logs-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Apply filters to the logs
  const applyFilters = (logs: any[]) => {
    return logs.filter(log => {
      // Filter by search term if provided
      if (searchTerm && !log.action.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !log.details.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply category filters
      if (log.action.toLowerCase().includes('connect') && !filters.connect) return false;
      if (log.action.toLowerCase().includes('disconnect') && !filters.disconnect) return false;
      if (log.action.toLowerCase().includes('login') && !filters.login) return false;
      if (log.action.toLowerCase().includes('error') || log.action.toLowerCase().includes('failed') && !filters.error) return false;
      
      // Check if log falls into "other" category
      const isOther = !['connect', 'disconnect', 'login', 'error', 'failed'].some(keyword => 
        log.action.toLowerCase().includes(keyword)
      );
      
      if (isOther && !filters.other) return false;
      
      return true;
    });
  };
  
  // Get icon based on action type
  const getActionIcon = (action: string) => {
    if (action.toLowerCase().includes('connect success') || action.toLowerCase().includes('login success')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (action.toLowerCase().includes('error') || action.toLowerCase().includes('failed')) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (action.toLowerCase().includes('connect') || action.toLowerCase().includes('login')) {
      return <Clock className="h-4 w-4 text-amber-500" />;
    }
    return null;
  };
  
  const filteredLogs = applyFilters(logs);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Connection Logs ({filteredLogs.length})</h3>
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7" 
            onClick={() => setIsFullscreen(true)}
            title="Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7" 
            onClick={handleDownloadLogs}
            title="Download logs"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="h-7 px-2 text-xs" 
            onClick={clearLogs}
          >
            Clear
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center">
        <Input 
          type="text" 
          placeholder="Search logs..." 
          className="h-7 text-xs w-full sm:w-auto sm:flex-1" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <Checkbox 
              id="filter-connect" 
              checked={filters.connect} 
              onCheckedChange={(checked) => setFilters({...filters, connect: !!checked})}
            />
            <Label htmlFor="filter-connect" className="text-xs cursor-pointer">Connect</Label>
          </div>
          <div className="flex items-center space-x-1">
            <Checkbox 
              id="filter-disconnect" 
              checked={filters.disconnect} 
              onCheckedChange={(checked) => setFilters({...filters, disconnect: !!checked})}
            />
            <Label htmlFor="filter-disconnect" className="text-xs cursor-pointer">Disconnect</Label>
          </div>
          <div className="flex items-center space-x-1">
            <Checkbox 
              id="filter-login" 
              checked={filters.login} 
              onCheckedChange={(checked) => setFilters({...filters, login: !!checked})}
            />
            <Label htmlFor="filter-login" className="text-xs cursor-pointer">Login</Label>
          </div>
          <div className="flex items-center space-x-1">
            <Checkbox 
              id="filter-error" 
              checked={filters.error} 
              onCheckedChange={(checked) => setFilters({...filters, error: !!checked})}
            />
            <Label htmlFor="filter-error" className="text-xs cursor-pointer">Errors</Label>
          </div>
          <div className="flex items-center space-x-1">
            <Checkbox 
              id="filter-other" 
              checked={filters.other} 
              onCheckedChange={(checked) => setFilters({...filters, other: !!checked})}
            />
            <Label htmlFor="filter-other" className="text-xs cursor-pointer">Other</Label>
          </div>
        </div>
      </div>

      <div className="border rounded-md h-64 overflow-auto text-xs" ref={logsContainerRef}>
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            No logs to display
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredLogs.map((log, index) => (
              <Card key={index} className="p-1.5 text-xs bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{log.action}</span>
                      <span className="text-[10px] text-gray-500">
                        {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                      </span>
                    </div>
                    <div className="text-[10px] whitespace-pre-wrap break-words text-gray-600 mt-0.5">
                      {log.details}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Connection Logs</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={handleDownloadLogs}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-7 px-2 text-xs" 
                  onClick={clearLogs}
                >
                  Clear Logs
                </Button>
                <DialogClose className="h-7 w-7 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 items-center mb-2">
            <Input 
              type="text" 
              placeholder="Search logs..." 
              className="h-8 text-sm flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fs-filter-connect" 
                  checked={filters.connect} 
                  onCheckedChange={(checked) => setFilters({...filters, connect: !!checked})}
                />
                <Label htmlFor="fs-filter-connect" className="text-sm cursor-pointer">Connect</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fs-filter-disconnect" 
                  checked={filters.disconnect} 
                  onCheckedChange={(checked) => setFilters({...filters, disconnect: !!checked})}
                />
                <Label htmlFor="fs-filter-disconnect" className="text-sm cursor-pointer">Disconnect</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fs-filter-login" 
                  checked={filters.login} 
                  onCheckedChange={(checked) => setFilters({...filters, login: !!checked})}
                />
                <Label htmlFor="fs-filter-login" className="text-sm cursor-pointer">Login</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fs-filter-error" 
                  checked={filters.error} 
                  onCheckedChange={(checked) => setFilters({...filters, error: !!checked})}
                />
                <Label htmlFor="fs-filter-error" className="text-sm cursor-pointer">Errors</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fs-filter-other" 
                  checked={filters.other} 
                  onCheckedChange={(checked) => setFilters({...filters, other: !!checked})}
                />
                <Label htmlFor="fs-filter-other" className="text-sm cursor-pointer">Other</Label>
              </div>
            </div>
          </div>

          <div className="flex-1 border rounded-md overflow-auto">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                No logs to display
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {filteredLogs.map((log, index) => (
                  <Card key={index} className="p-3 text-sm bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{log.action}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}
                          </span>
                        </div>
                        <div className="text-xs whitespace-pre-wrap break-words text-gray-600 mt-1">
                          {log.details}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConnectionLogsTab;
