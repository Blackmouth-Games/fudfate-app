
import React, { useState } from 'react';
import { 
  Settings, RefreshCw, Bug, Database, Trash, 
  FileJson, X, PanelLeft, Code, Palette
} from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    <TooltipProvider>
      <div className="fixed top-20 left-4 z-40">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-amber-500 text-white hover:bg-amber-600 shadow-lg border-2 border-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Code className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Developer Tools</p>
          </TooltipContent>
        </Tooltip>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-12 left-0 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-amber-50">
                <div className="flex items-center">
                  <PanelLeft className="h-4 w-4 text-amber-600 mr-2" />
                  <h3 className="font-pixel text-amber-800 text-sm">Developer Tools</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-gray-500 hover:text-gray-700" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              <Tabs defaultValue="wallet" className="flex-grow overflow-hidden flex flex-col">
                <TabsList className="justify-start px-2 pt-2 border-b border-gray-100 h-10">
                  <TabsTrigger value="wallet" className="text-xs py-1 px-1.5 h-7">
                    Wallet
                  </TabsTrigger>
                  <TabsTrigger value="env" className="text-xs py-1 px-1.5 h-7">
                    Config
                  </TabsTrigger>
                  <TabsTrigger value="debug" className="text-xs py-1 px-1.5 h-7">
                    Debug
                  </TabsTrigger>
                  {routes.length > 0 && (
                    <TabsTrigger value="nav" className="text-xs py-1 px-1.5 h-7">
                      Routes
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <div className="overflow-y-auto flex-grow p-2">
                  <TabsContent value="wallet" className="mt-0 space-y-3">
                    <div className="p-2 bg-gray-50 rounded-md text-xs">
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-gray-600">Status:</span>
                        <span className={walletAddress ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {walletAddress ? 'Connected' : 'Disconnected'}
                        </span>
                        
                        <span className="text-gray-600">Type:</span>
                        <span className="font-mono">{walletType || 'None'}</span>
                        
                        <span className="text-gray-600">Address:</span>
                        <span className="font-mono truncate">{formatAddress(walletAddress)}</span>
                        
                        <span className="text-gray-600">User ID:</span>
                        <span className="font-mono text-xs truncate">{userData?.userId || 'None'}</span>
                        
                        <span className="text-gray-600">Can Read:</span>
                        <span className={`font-medium ${userData?.runsToday ? 'text-green-600' : 'text-red-600'}`}>
                          {userData?.runsToday ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
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
                      
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full text-xs h-7"
                        onClick={disconnectWallet}
                      >
                        Disconnect Wallet
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="env" className="mt-0 space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium block">Environment</Label>
                      <RadioGroup 
                        value={environment} 
                        onValueChange={(value) => setEnvironment(value as Environment)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="development" id="development" className="scale-75" />
                          <Label htmlFor="development" className="cursor-pointer text-xs">Dev</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="production" id="production" className="scale-75" />
                          <Label htmlFor="production" className="cursor-pointer text-xs">Prod</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="p-2 bg-gray-50 rounded-md text-xs space-y-1">
                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium text-gray-700">API Webhooks</summary>
                        <div className="mt-1 space-y-1 text-[10px]">
                          <div>
                            <span className="font-medium">Login:</span> 
                            <code className="block mt-0.5 text-[10px] break-all bg-gray-100 p-0.5 rounded">{webhooks.login}</code>
                          </div>
                          <div>
                            <span className="font-medium">History:</span>
                            <code className="block mt-0.5 text-[10px] break-all bg-gray-100 p-0.5 rounded">{webhooks.history}</code>
                          </div>
                          <div>
                            <span className="font-medium">Deck:</span>
                            <code className="block mt-0.5 text-[10px] break-all bg-gray-100 p-0.5 rounded">{webhooks.deck}</code>
                          </div>
                        </div>
                      </details>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="debug" className="mt-0">
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
                  </TabsContent>
                  
                  {routes.length > 0 && (
                    <TabsContent value="nav" className="mt-0">
                      <div className="grid gap-1">
                        {routes.map((route) => (
                          <Button
                            key={route.path}
                            variant="outline"
                            size="sm"
                            className="justify-start text-xs h-7"
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
      </div>
    </TooltipProvider>
  );
};

export default DevToolPanel;
