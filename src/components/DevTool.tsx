
import React, { useState } from 'react';
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

interface DevToolProps {
  routes: Array<{
    path: string;
    name: string;
  }>;
}

const DevTool = ({ routes }: DevToolProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
          <div className="px-4 py-2 grid gap-4">
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
