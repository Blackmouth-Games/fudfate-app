
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
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
import { Environment } from '@/config/webhooks';
import { useWallet } from '@/contexts/WalletContext';

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
  const { overrideUserData } = useWallet();

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
        <DrawerContent className="max-w-sm mx-auto">
          <DrawerHeader>
            <DrawerTitle className="text-center text-xl font-pixel gold-text">Dev Navigation</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-2 space-y-6">
            <div className="grid gap-4">
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
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium mb-3">Environment</h4>
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
              
              <div className="mt-2 text-xs text-gray-500">
                Current: <span className="font-semibold">{environment}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium mb-3">Mock User Data</h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="mock-runs-today" className="cursor-pointer">Allow Daily Reading</Label>
                <Switch 
                  id="mock-runs-today" 
                  checked={mockRunsToday}
                  onCheckedChange={handleMockRunsTodayChange}
                />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Current runs_today: <span className="font-semibold">{mockRunsToday ? 'true' : 'false'}</span>
              </div>
            </div>
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
