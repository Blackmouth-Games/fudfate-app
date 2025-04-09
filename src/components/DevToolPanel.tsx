
import React, { useState } from 'react';
import { Settings, RefreshCw, Bug, Database, Trash, FileJson, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/hooks/useEnvironment';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Environment } from '@/config/webhooks';

interface DevToolPanelProps {
  routes?: Array<{
    path: string;
    name: string;
  }>;
}

const DevToolPanel: React.FC<DevToolPanelProps> = ({ routes = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [environment, setEnvironment] = useState<Environment>('production');
  const [mockRunsToday, setMockRunsToday] = useState<boolean>(false);
  const [mockUserId, setMockUserId] = useState<string>('');
  const { overrideUserData, walletAddress, walletType, userData, disconnectWallet } = useWallet();
  const { webhooks } = useEnvironment();

  // Load stored values
  React.useEffect(() => {
    const savedEnvironment = localStorage.getItem('appEnvironment') as Environment | null;
    if (savedEnvironment && (savedEnvironment === 'development' || savedEnvironment === 'production')) {
      setEnvironment(savedEnvironment);
    }
    
    const savedMockRunsToday = localStorage.getItem('mockRunsToday');
    if (savedMockRunsToday) {
      setMockRunsToday(savedMockRunsToday === 'true');
    }
    
    const savedMockUserId = localStorage.getItem('mockUserId');
    if (savedMockUserId) {
      setMockUserId(savedMockUserId);
    }
  }, []);

  // Save environment to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem('appEnvironment', environment);
    // Broadcast the environment change
    window.dispatchEvent(new CustomEvent('environment-changed', { detail: { environment } }));
  }, [environment]);

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

  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-amber-500 text-white hover:bg-amber-600 shadow-lg border-2 border-white animate-pulse-glow"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Settings className="h-6 w-6" />
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="font-pixel gold-text text-lg">Developer Tools</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Tabs defaultValue="wallet" className="flex-grow overflow-hidden flex flex-col">
              <TabsList className="justify-start px-3 pt-2 border-b border-gray-100">
                <TabsTrigger value="wallet" className="text-xs py-1 px-2">Wallet</TabsTrigger>
                <TabsTrigger value="env" className="text-xs py-1 px-2">Environment</TabsTrigger>
                <TabsTrigger value="debug" className="text-xs py-1 px-2">Debug</TabsTrigger>
                {routes.length > 0 && (
                  <TabsTrigger value="nav" className="text-xs py-1 px-2">Navigation</TabsTrigger>
                )}
              </TabsList>
              
              <div className="overflow-y-auto flex-grow p-3">
                <TabsContent value="wallet" className="mt-0">
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Status:</span>
                        <span className={walletAddress ? 'text-green-600' : 'text-red-600'}>
                          {walletAddress ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Type:</span>
                        <span className="font-mono">{walletType || 'None'}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Address:</span>
                        <span className="font-mono">{formatAddress(walletAddress)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">User ID:</span>
                        <span className="font-mono text-xs">{userData?.userId || 'None'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Can Read Today:</span>
                        <span className={`font-medium ${userData?.runsToday ? 'text-green-600' : 'text-red-600'}`}>
                          {userData?.runsToday ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="mock-runs-today" className="cursor-pointer text-sm">Allow Daily Reading</Label>
                        <Switch 
                          id="mock-runs-today" 
                          checked={mockRunsToday}
                          onCheckedChange={handleMockRunsTodayChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mock-user-id" className="text-sm">Override User ID</Label>
                        <Input 
                          id="mock-user-id" 
                          value={mockUserId} 
                          onChange={(e) => handleMockUserIdChange(e.target.value)}
                          placeholder="Enter custom user ID"
                          className="text-sm h-8"
                        />
                      </div>
                      
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full text-xs h-8"
                        onClick={disconnectWallet}
                      >
                        Force Disconnect Wallet
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="env" className="mt-0">
                  <div className="space-y-4">
                    <RadioGroup 
                      value={environment} 
                      onValueChange={(value) => setEnvironment(value as Environment)}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="development" id="development" />
                        <Label htmlFor="development" className="cursor-pointer">Development</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="production" id="production" />
                        <Label htmlFor="production" className="cursor-pointer">Production</Label>
                      </div>
                    </RadioGroup>
                    
                    <div className="p-3 bg-gray-50 rounded-md text-xs">
                      <div className="mb-1">
                        <span className="font-medium">Login webhook:</span> 
                        <span className="font-mono text-xs break-all block mt-1">{webhooks.login}</span>
                      </div>
                      <div className="mb-1">
                        <span className="font-medium">History webhook:</span>
                        <span className="font-mono text-xs break-all block mt-1">{webhooks.history}</span>
                      </div>
                      <div>
                        <span className="font-medium">Deck webhook:</span>
                        <span className="font-mono text-xs break-all block mt-1">{webhooks.deck}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="debug" className="mt-0">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="flex items-center justify-center h-8"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Refresh</span>
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
                      className="flex items-center justify-center h-8"
                    >
                      <Bug className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Log State</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        localStorage.clear();
                        toast.success("Local storage cleared");
                        window.location.reload();
                      }}
                      className="flex items-center justify-center h-8"
                    >
                      <Trash className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Clear Storage</span>
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
                      className="flex items-center justify-center h-8"
                    >
                      <Database className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Show Storage</span>
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
                      className="flex items-center justify-center h-8 col-span-2"
                    >
                      <FileJson className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Copy State</span>
                    </Button>
                  </div>
                </TabsContent>
                
                {routes.length > 0 && (
                  <TabsContent value="nav" className="mt-0">
                    <div className="grid gap-2">
                      {routes.map((route) => (
                        <Button
                          key={route.path}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-8"
                          onClick={() => {
                            window.location.href = route.path;
                            setIsOpen(false);
                          }}
                        >
                          {route.name}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DevToolPanel;
