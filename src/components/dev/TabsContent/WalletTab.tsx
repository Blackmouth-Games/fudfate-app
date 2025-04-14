
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWallet } from '@/contexts/WalletContext';
import { ArrowDownToLine, ArrowUpFromLine, ClipboardCopy, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { performWalletSecurityCheck, SecurityCheckResult } from '@/utils/wallet-security';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const WalletTab: React.FC = () => {
  const { walletAddress, walletType, userData, connectionLogs, disconnectWallet, overrideUserData } = useWallet();
  const [mockRunsToday, setMockRunsToday] = useState<boolean>(false);
  const [mockUserId, setMockUserId] = useState<string>('');
  const [expandedLogs, setExpandedLogs] = useState<boolean>(false);
  const [securityResults, setSecurityResults] = useState<SecurityCheckResult[]>([]);
  const [showSecurityDetails, setShowSecurityDetails] = useState<boolean>(false);

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

    // Run security check
    setSecurityResults(performWalletSecurityCheck(walletType));
  }, [walletType]);

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

  // Get overall security status
  const getSecurityStatus = () => {
    const hasWarnings = securityResults.some(result => !result.passed);
    return {
      status: hasWarnings ? 'warning' : 'secure',
      text: hasWarnings ? 'Security warnings detected' : 'Connection secure',
      color: hasWarnings ? 'text-amber-600' : 'text-green-600'
    };
  };

  const securityStatus = getSecurityStatus();

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

          <span className="text-gray-600">Security:</span>
          <div className="flex items-center gap-1">
            {securityStatus.status === 'secure' ? (
              <ShieldCheck className="h-3 w-3 text-green-600" />
            ) : (
              <ShieldAlert className="h-3 w-3 text-amber-600" />
            )}
            <span className={`font-medium ${securityStatus.color}`}>
              {securityStatus.text}
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 mt-3">
        {walletAddress && (
          <Accordion type="single" collapsible>
            <AccordionItem value="security">
              <AccordionTrigger className="text-xs py-1">
                Security Analysis
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-xs space-y-2">
                  {securityResults.map((result, index) => (
                    <div key={index} className="border rounded p-2 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <p className="font-medium capitalize">{result.checkType} Check</p>
                        <span className={result.passed ? 'text-green-600' : 'text-amber-600'}>
                          {result.passed ? 'Passed' : 'Warning'}
                        </span>
                      </div>
                      
                      {result.warnings.length > 0 && (
                        <div className="mt-1">
                          <p className="text-amber-700">Warnings:</p>
                          <ul className="list-disc pl-4 text-amber-600">
                            {result.warnings.map((warning, idx) => (
                              <li key={idx}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.recommendations.length > 0 && (
                        <div className="mt-1">
                          <p className="text-gray-700">Recommendations:</p>
                          <ul className="list-disc pl-4 text-gray-600">
                            {result.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

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
