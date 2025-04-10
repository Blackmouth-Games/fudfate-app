
import React, { useState } from 'react';
import { 
  PanelLeft, Code, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import WalletTab from './TabsContent/WalletTab';
import ConfigTab from './TabsContent/ConfigTab';
import DebugTab from './TabsContent/DebugTab';
import RoutesTab from './TabsContent/RoutesTab';
import WebhookLogTab from './TabsContent/WebhookLogTab';

interface DevToolPanelProps {
  routes?: Array<{
    path: string;
    name: string;
  }>;
}

const DevToolPanel: React.FC<DevToolPanelProps> = ({ routes = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

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
                  <TabsTrigger value="webhooks" className="text-xs py-1 px-1.5 h-7">
                    Logs
                  </TabsTrigger>
                  {routes.length > 0 && (
                    <TabsTrigger value="nav" className="text-xs py-1 px-1.5 h-7">
                      Routes
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <div className="overflow-y-auto flex-grow p-2">
                  <TabsContent value="wallet" className="mt-0 space-y-3">
                    <WalletTab />
                  </TabsContent>
                  
                  <TabsContent value="env" className="mt-0">
                    <ConfigTab />
                  </TabsContent>
                  
                  <TabsContent value="debug" className="mt-0">
                    <DebugTab />
                  </TabsContent>
                  
                  <TabsContent value="webhooks" className="mt-0">
                    <WebhookLogTab />
                  </TabsContent>
                  
                  {routes.length > 0 && (
                    <TabsContent value="nav" className="mt-0">
                      <RoutesTab routes={routes} />
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
