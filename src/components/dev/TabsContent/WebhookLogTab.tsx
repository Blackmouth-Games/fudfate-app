
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Download, Maximize2, RefreshCw, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { WebhookLog } from '@/services/webhook-service';

const WebhookLogTab = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    login: true,
    reading: true,
    deck: true,
    history: true,
    success: true,
    error: true,
    development: true,
    production: true
  });
  
  // Load logs from localStorage
  const loadLogs = () => {
    try {
      const storedLogs = localStorage.getItem('webhookLogs');
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }
    } catch (error) {
      console.error('Error loading webhook logs:', error);
    }
  };
  
  // Clear all webhook logs
  const clearLogs = () => {
    try {
      localStorage.setItem('webhookLogs', JSON.stringify([]));
      setLogs([]);
    } catch (error) {
      console.error('Error clearing webhook logs:', error);
    }
  };
  
  // Load logs on component mount and listen for new logs
  useEffect(() => {
    loadLogs();
    
    // Listen for webhook-log events
    const handleWebhookLog = (event: any) => {
      setLogs(prev => {
        const newLogs = [event.detail, ...prev];
        return newLogs.slice(0, 50); // Keep only the last 50 logs
      });
    };
    
    window.addEventListener('webhook-log', handleWebhookLog);
    
    return () => {
      window.removeEventListener('webhook-log', handleWebhookLog);
    };
  }, []);
  
  // Function to download logs as JSON
  const handleDownloadLogs = () => {
    const filteredLogs = applyFilters(logs);
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `webhook-logs-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Apply filters to the logs
  const applyFilters = (logs: WebhookLog[]) => {
    return logs.filter(log => {
      // Filter by search term if provided
      if (searchTerm && 
          !log.type.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !log.url.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !JSON.stringify(log.request).toLowerCase().includes(searchTerm.toLowerCase()) &&
          !JSON.stringify(log.response).toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply type filters
      if (log.type.toLowerCase() === 'login' && !filters.login) return false;
      if (log.type.toLowerCase() === 'reading' && !filters.reading) return false;
      if (log.type.toLowerCase() === 'deck' && !filters.deck) return false;
      if (log.type.toLowerCase() === 'history' && !filters.history) return false;
      
      // Apply status filters
      if (log.error && !filters.error) return false;
      if (!log.error && !filters.success) return false;
      
      // Apply environment filters
      if (log.environment === 'development' && !filters.development) return false;
      if (log.environment === 'production' && !filters.production) return false;
      
      return true;
    });
  };
  
  const filteredLogs = applyFilters(logs);
  
  // Get status badge based on log
  const getStatusBadge = (log: WebhookLog) => {
    if (log.error) {
      return <Badge variant="destructive" className="text-[10px] h-5">Error</Badge>;
    } else if (log.status && log.status >= 200 && log.status < 300) {
      return <Badge variant="outline" className="text-[10px] h-5 border-green-500 text-green-700">Success {log.status}</Badge>;
    } else if (log.status) {
      return <Badge variant="outline" className="text-[10px] h-5">{log.status}</Badge>;
    }
    return null;
  };
  
  // Get icon based on log type
  const getTypeIcon = (log: WebhookLog) => {
    if (log.error) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (log.status && log.status >= 200 && log.status < 300) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-amber-500" />;
  };
  
  // Format JSON for display
  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">API Webhook Logs ({filteredLogs.length})</h3>
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
            variant="outline" 
            size="icon" 
            className="h-7 w-7" 
            onClick={loadLogs}
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
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
              id="filter-login" 
              checked={filters.login} 
              onCheckedChange={(checked) => setFilters({...filters, login: !!checked})}
            />
            <Label htmlFor="filter-login" className="text-xs cursor-pointer">Login</Label>
          </div>
          <div className="flex items-center space-x-1">
            <Checkbox 
              id="filter-reading" 
              checked={filters.reading} 
              onCheckedChange={(checked) => setFilters({...filters, reading: !!checked})}
            />
            <Label htmlFor="filter-reading" className="text-xs cursor-pointer">Reading</Label>
          </div>
          <div className="flex items-center space-x-1">
            <Checkbox 
              id="filter-success" 
              checked={filters.success} 
              onCheckedChange={(checked) => setFilters({...filters, success: !!checked})}
            />
            <Label htmlFor="filter-success" className="text-xs cursor-pointer">Success</Label>
          </div>
          <div className="flex items-center space-x-1">
            <Checkbox 
              id="filter-error" 
              checked={filters.error} 
              onCheckedChange={(checked) => setFilters({...filters, error: !!checked})}
            />
            <Label htmlFor="filter-error" className="text-xs cursor-pointer">Errors</Label>
          </div>
        </div>
      </div>

      <div className="border rounded-md h-64 overflow-auto text-xs">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            No logs to display
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="p-1.5 text-xs bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {getTypeIcon(log)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium truncate capitalize">{log.type}</span>
                        {getStatusBadge(log)}
                        <Badge variant="outline" className="text-[10px] h-5">
                          {log.environment}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-0.5 truncate">
                      {log.url}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Webhook Logs</span>
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
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={loadLogs}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-7 px-2 text-xs" 
                  onClick={clearLogs}
                >
                  Clear
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
                  id="fs-filter-login" 
                  checked={filters.login} 
                  onCheckedChange={(checked) => setFilters({...filters, login: !!checked})}
                />
                <Label htmlFor="fs-filter-login" className="text-sm cursor-pointer">Login</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fs-filter-reading" 
                  checked={filters.reading} 
                  onCheckedChange={(checked) => setFilters({...filters, reading: !!checked})}
                />
                <Label htmlFor="fs-filter-reading" className="text-sm cursor-pointer">Reading</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fs-filter-deck" 
                  checked={filters.deck} 
                  onCheckedChange={(checked) => setFilters({...filters, deck: !!checked})}
                />
                <Label htmlFor="fs-filter-deck" className="text-sm cursor-pointer">Deck</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fs-filter-history" 
                  checked={filters.history} 
                  onCheckedChange={(checked) => setFilters({...filters, history: !!checked})}
                />
                <Label htmlFor="fs-filter-history" className="text-sm cursor-pointer">History</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fs-filter-success" 
                  checked={filters.success} 
                  onCheckedChange={(checked) => setFilters({...filters, success: !!checked})}
                />
                <Label htmlFor="fs-filter-success" className="text-sm cursor-pointer">Success</Label>
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
                  id="fs-filter-development" 
                  checked={filters.development} 
                  onCheckedChange={(checked) => setFilters({...filters, development: !!checked})}
                />
                <Label htmlFor="fs-filter-development" className="text-sm cursor-pointer">Development</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fs-filter-production" 
                  checked={filters.production} 
                  onCheckedChange={(checked) => setFilters({...filters, production: !!checked})}
                />
                <Label htmlFor="fs-filter-production" className="text-sm cursor-pointer">Production</Label>
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
                {filteredLogs.map((log) => (
                  <Card key={log.id} className="p-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getTypeIcon(log)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate capitalize">{log.type}</span>
                            {getStatusBadge(log)}
                            <Badge variant="outline" className="text-xs">
                              {log.environment}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          <div className="font-medium">URL:</div>
                          <div className="break-all bg-gray-100 p-1 rounded mt-1 mb-2">{log.url}</div>
                          
                          <div className="font-medium">Request:</div>
                          <pre className="bg-gray-100 p-1 rounded mt-1 mb-2 overflow-auto max-h-40 text-[10px]">
                            {formatJson(log.request)}
                          </pre>
                          
                          {log.response && (
                            <>
                              <div className="font-medium">Response:</div>
                              <pre className="bg-gray-100 p-1 rounded mt-1 mb-2 overflow-auto max-h-40 text-[10px]">
                                {formatJson(log.response)}
                              </pre>
                            </>
                          )}
                          
                          {log.error && (
                            <>
                              <div className="font-medium text-red-600">Error:</div>
                              <pre className="bg-red-50 text-red-800 p-1 rounded mt-1 overflow-auto max-h-40 text-[10px]">
                                {log.error}
                              </pre>
                            </>
                          )}
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

export default WebhookLogTab;
