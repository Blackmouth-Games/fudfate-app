
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, RefreshCw, Code, Wallet, Bug, Database, Trash, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from '@/components/ui/drawer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Environment } from '@/config/webhooks';
import { useWallet } from '@/contexts/WalletContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DevToolProps {
  routes: Array<{
    path: string;
    name: string;
  }>;
}

const DevTool = ({ routes }: DevToolProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [environment, setEnvironment] = useState<Environment>('development');
  const [mockRunsToday, setMockRunsToday] = useState<boolean>(false);
  const [mockUserId, setMockUserId] = useState<string>('');
  const { overrideUserData, walletAddress, walletType, userData, disconnectWallet } = useWallet();

  // Load environment from localStorage on component mount
  useEffect(() => {
    const savedEnvironment = localStorage.getItem('appEnvironment') as Environment | null;
    if (savedEnvironment && (savedEnvironment === 'development' || savedEnvironment === 'production')) {
      setEnvironment(savedEnvironment);
    }
    
    // Load mock settings
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
  useEffect(() => {
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

  // Clear localStorage
  const handleClearLocalStorage = () => {
    localStorage.clear();
    toast.success("Local storage cleared");
    window.location.reload();
  };

  // Force refresh
  const handleForceRefresh = () => {
    window.location.reload();
  };

  // Format wallet address
  const formatAddress = (address: string | null): string => {
    if (!address) return 'Not connected';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-full bg-amber-500 text-white hover:bg-amber-600 shadow-lg border-2 border-white animate-pulse-glow"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle className="text-center text-xl font-pixel gold-text">Developer Tools</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-6 max-h-[70vh] overflow-y-auto">
            <Accordion type="single" collapsible>
              <AccordionItem value="navigation">
                <AccordionTrigger className="font-medium">Navigation</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2 mt-2">
                    {routes.map((route) => (
                      <Link
                        key={route.path}
                        to={route.path}
                        className="w-full px-4 py-2 text-center bg-white border-2 border-amber-500 rounded-md hover:bg-amber-50 transition-colors font-pixel"
                        onClick={() => setIsOpen(false)}
                      >
                        {route.name}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="wallet">
                <AccordionTrigger className="font-medium">Wallet Information</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium">Status: 
                        <span className={`ml-2 ${walletAddress ? 'text-green-600' : 'text-red-600'}`}>
                          {walletAddress ? 'Connected' : 'Disconnected'}
                        </span>
                      </p>
                      <p className="text-sm">Type: <span className="font-mono">{walletType || 'None'}</span></p>
                      <p className="text-sm">Address: <span className="font-mono">{formatAddress(walletAddress)}</span></p>
                      <p className="text-sm">User ID: <span className="font-mono">{userData?.userId || 'None'}</span></p>
                      <p className="text-sm">Can Read Today: 
                        <span className={`ml-1 font-medium ${userData?.runsToday ? 'text-green-600' : 'text-red-600'}`}>
                          {userData?.runsToday ? 'Yes' : 'No'}
                        </span>
                      </p>
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={disconnectWallet}
                    >
                      Force Disconnect Wallet
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="environment">
                <AccordionTrigger className="font-medium">Environment</AccordionTrigger>
                <AccordionContent>
                  <RadioGroup 
                    value={environment} 
                    onValueChange={(value) => setEnvironment(value as Environment)}
                    className="flex flex-col space-y-2 mt-2"
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
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Current: <span className="font-semibold">{environment}</span>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="mocks">
                <AccordionTrigger className="font-medium">Mock User Data</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="mock-runs-today" className="cursor-pointer">Allow Daily Reading</Label>
                        <Switch 
                          id="mock-runs-today" 
                          checked={mockRunsToday}
                          onCheckedChange={handleMockRunsTodayChange}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Current runs_today: <span className="font-semibold">{mockRunsToday ? 'true' : 'false'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mock-user-id">Override User ID</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="mock-user-id" 
                          value={mockUserId} 
                          onChange={(e) => handleMockUserIdChange(e.target.value)}
                          placeholder="Enter custom user ID"
                          className="text-sm"
                        />
                      </div>
                      {mockUserId && (
                        <div className="text-xs text-gray-500">
                          Using custom ID: <span className="font-semibold">{mockUserId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="utils">
                <AccordionTrigger className="font-medium">Utilities</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleForceRefresh}
                      className="flex items-center justify-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh App
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
                      className="flex items-center justify-center"
                    >
                      <Bug className="h-4 w-4 mr-1" />
                      Log State
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearLocalStorage}
                      className="flex items-center justify-center"
                    >
                      <Trash className="h-4 w-4 mr-1" />
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
                      className="flex items-center justify-center"
                    >
                      <Database className="h-4 w-4 mr-1" />
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
                      className="flex items-center justify-center"
                    >
                      <FileJson className="h-4 w-4 mr-1" />
                      Copy State
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <DrawerFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default DevTool;
