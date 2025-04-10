
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bug, Database, Trash, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/hooks/useEnvironment';

const DebugTab: React.FC = () => {
  const { walletAddress, walletType, userData } = useWallet();
  const { environment } = useEnvironment();

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => window.location.reload()}
        className="flex items-center justify-center h-7 text-xs"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Refresh
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => {
          console.log("Current state:", {
            walletType,
            walletAddress,
            userData,
            environment,
            localStorage: { ...localStorage }
          });
          toast.success("Logged state to console");
        }}
        className="flex items-center justify-center h-7 text-xs"
      >
        <Bug className="h-3 w-3 mr-1" />
        Log State
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => {
          localStorage.clear();
          toast.success("Local storage cleared");
          window.location.reload();
        }}
        className="flex items-center justify-center h-7 text-xs"
      >
        <Trash className="h-3 w-3 mr-1" />
        Clear Storage
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => {
          console.log("Local Storage:", Object.entries(localStorage).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>));
          toast.success("Logged localStorage to console");
        }}
        className="flex items-center justify-center h-7 text-xs"
      >
        <Database className="h-3 w-3 mr-1" />
        Show Storage
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(JSON.stringify({
            walletType,
            walletAddress,
            userData,
            environment
          }, null, 2));
          toast.success("Copied state to clipboard");
        }}
        className="flex items-center justify-center h-7 text-xs col-span-2"
      >
        <FileJson className="h-3 w-3 mr-1" />
        Copy State
      </Button>
    </div>
  );
};

export default DebugTab;
