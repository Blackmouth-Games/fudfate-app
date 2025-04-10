
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWallet } from '@/contexts/WalletContext';
import { ArrowDownToLine, ArrowUpFromLine, ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';

const WalletTab: React.FC = () => {
  const { walletAddress, walletType, userData, connectionLogs, disconnectWallet, overrideUserData } = useWallet();
  const [mockRunsToday, setMockRunsToday] = useState<boolean>(false);
  const [mockUserId, setMockUserId] = useState<string>('');
  const [expandedLogs, setExpandedLogs] = useState<boolean>(false);

  // Load stored values
  useEffect(() => {
    const savedMockRunsToday = localStorage.getItem('mockRunsToday');
    if (savedMockRunsToday) {
      setMockRunsToday(savedMockRunsToday === 'true');
    }
    
    const savedMockUserId = localStorage.getItem('mockUserId');
    if (savedMockUserId) {
      setMockUserId(savedMockUserId);
    }
  }, []);

  // Handle mock runs_today change
  const handleMockRunsTodayChange = (checked: boolean) => {
    setMockRunsToday(checked);
    localStorage.setItem('mockRunsToday', String(checked));
    
    // Apply the override
    overrideUserData({ runsToday: checked });
  };

  // Handle mock user ID change
  const handleMockUserIdChange = (value: string) => {
    setMockUserId(value);
    localStorage.setItem('mockUserId', value);
    
    if (value) {
      overrideUserData({ userId: value });
    }
  };

  // Format wallet address
  const formatAddress = (address: string | null): string => {
    if (!address) return 'Not connected';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <>
      <div className="p-2 bg-gray-50 rounded-md text-xs">
        <div className="grid grid-cols-2 gap-1">
          <span className="text-gray-600">Status:</span>
          <div className="flex items-center">
            <span className={walletAddress ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {walletAddress ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <span className="text-gray-600">Type:</span>
          <span className="font-mono">{walletType || 'None'}</span>
          
          <span className="text-gray-600">Address:</span>
          <div className="flex items-center font-mono truncate gap-1">
            <span className="truncate">{formatAddress(walletAddress)}</span>
            {walletAddress && (
              <button 
                onClick={() => copyToClipboard(walletAddress)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ClipboardCopy className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <span className="text-gray-600">User ID:</span>
          <div className="flex items-center font-mono text-xs truncate gap-1">
            <span className="truncate">{userData?.userId || 'None'}</span>
            {userData?.userId && (
              <button 
                onClick={() => copyToClipboard(userData?.userId || '')}
                className="text-gray-500 hover:text-gray-700"
              >
                <ClipboardCopy className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <span className="text-gray-600">Can Read:</span>
          <span className={`font-medium ${userData?.runsToday ? 'text-green-600' : 'text-red-600'}`}>
            {userData?.runsToday ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 mt-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="mock-runs-today" className="cursor-pointer text-xs">Allow Daily Reading</Label>
          <Switch 
            id="mock-runs-today" 
            checked={mockRunsToday}
            onCheckedChange={handleMockRunsTodayChange}
            className="scale-75"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="mock-user-id" className="text-xs">Override User ID</Label>
          <Input 
            id="mock-user-id" 
            value={mockUserId} 
            onChange={(e) => handleMockUserIdChange(e.target.value)}
            placeholder="Enter custom user ID"
            className="text-xs h-7"
          />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Connection Logs</Label>
            <button 
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              onClick={() => setExpandedLogs(!expandedLogs)}
            >
              {expandedLogs ? (
                <>
                  <ArrowUpFromLine className="h-3 w-3" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="h-3 w-3" />
                  <span>Expand</span>
                </>
              )}
            </button>
          </div>
          
          {expandedLogs && connectionLogs && connectionLogs.length > 0 ? (
            <Textarea 
              value={connectionLogs.map(log => 
                `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.action}: ${log.details}`
              ).join('\n')}
              readOnly
              className="text-xs h-24 font-mono bg-black text-green-400 resize-none"
            />
          ) : (
            <div className="bg-gray-100 p-2 text-gray-500 text-xs rounded">
              {connectionLogs && connectionLogs.length > 0 
                ? `${connectionLogs.length} log entries. Click 'Expand' to view.` 
                : 'No connection logs available.'}
            </div>
          )}
        </div>
        
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full text-xs h-7 mt-2"
          onClick={disconnectWallet}
        >
          Disconnect Wallet
        </Button>
      </div>
    </>
  );
};

export default WalletTab;
