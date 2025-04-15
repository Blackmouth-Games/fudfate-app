import React, { useState, useEffect } from 'react';
import { 
  PanelLeft, Code, X, GripHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEnvironment } from '@/hooks/useEnvironment';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Resizable } from 're-resizable';
import WalletTab from './TabsContent/WalletTab';
import ConfigTab from './TabsContent/ConfigTab';
import DebugTab from './TabsContent/DebugTab';
import RoutesTab from './TabsContent/RoutesTab';
import WebhookLogTab from './TabsContent/WebhookLogTab';
import ConnectionLogsTab from './TabsContent/ConnectionLogsTab';
import DecksTab from './TabsContent/DecksTab';
import { useTarot } from '@/contexts/TarotContext';

interface DevToolPanelProps {
  routes?: Array<{
    path: string;
    name: string;
  }>;
}

const DevToolPanel = ({ routes = [] }: DevToolPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { environment, setEnvironment } = useEnvironment();
  const { selectedDeck } = useTarot();
  const [panelSize, setPanelSize] = useState(() => {
    const savedSize = localStorage.getItem('devToolPanelSize');
    return savedSize ? JSON.parse(savedSize) : { width: '70vw', height: 600 };
  });

  useEffect(() => {
    localStorage.setItem('devToolPanelSize', JSON.stringify(panelSize));
  }, [panelSize]);

  const toggleEnvironment = () => {
    const newEnvironment = environment === 'production' ? 'development' : 'production';
    setEnvironment(newEnvironment);
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 left-4 z-50">
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
            <p className="text-xs">Developer Tools</p>
          </TooltipContent>
        </Tooltip>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-12 left-0 z-50"
            >
              <Resizable
                size={panelSize}
                onResizeStop={(e, direction, ref, d) => {
                  setPanelSize({
                    width: panelSize.width + d.width,
                    height: panelSize.height + d.height
                  });
                }}
                enable={{ 
                  top: true,
                  right: true,
                  topRight: true
                }}
                minHeight={400}
                maxHeight={window.innerHeight - 100}
                minWidth={600}
                maxWidth={window.innerWidth - 50}
                handleComponent={{
                  top: (
                    <div className="absolute top-0 left-0 right-0 h-2 cursor-row-resize flex items-center justify-center hover:bg-amber-100 transition-colors">
                      <GripHorizontal className="h-3 w-3 text-amber-400" />
                    </div>
                  ),
                  right: (
                    <div className="absolute top-0 bottom-0 right-0 w-2 cursor-col-resize flex items-center justify-center hover:bg-amber-100 transition-colors">
                      <GripHorizontal className="h-3 w-3 text-amber-400 rotate-90" />
                    </div>
                  ),
                  topRight: (
                    <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize hover:bg-amber-100 transition-colors rounded-tr-lg" />
                  )
                }}
              >
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full h-full overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-amber-50">
                    <div className="flex items-center">
                      <PanelLeft className="h-4 w-4 text-amber-600 mr-2" />
                      <h3 className="font-pixel text-amber-800 text-sm">Developer Tools</h3>
                      <div className="flex items-center ml-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`cursor-pointer flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${
                                environment === 'production' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                              }`}
                              onClick={toggleEnvironment}
                            >
                              {environment === 'production' ? 'PROD' : 'DEV'}
                              <Switch 
                                checked={environment === 'development'}
                                onCheckedChange={toggleEnvironment}
                                className="scale-50 ml-1" 
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">Click to toggle environment</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {selectedDeck && (
                        <div className="ml-2 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                          Deck: {selectedDeck}
                        </div>
                      )}
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

                  <Tabs defaultValue="reading" className="flex-grow overflow-hidden flex flex-col">
                    <TabsList className="justify-start px-2 pt-2 border-b border-gray-100 h-10 overflow-x-auto">
                      <TabsTrigger value="reading" className="text-xs py-1 px-2 h-7">
                        Reading
                      </TabsTrigger>
                      <TabsTrigger value="webhooks" className="text-xs py-1 px-2 h-7">
                        API Logs
                      </TabsTrigger>
                      <TabsTrigger value="logs" className="text-xs py-1 px-2 h-7">
                        Conn Logs
                      </TabsTrigger>
                      <TabsTrigger value="debug" className="text-xs py-1 px-2 h-7">
                        Debug
                      </TabsTrigger>
                      <TabsTrigger value="wallet" className="text-xs py-1 px-2 h-7">
                        Wallet
                      </TabsTrigger>
                      <TabsTrigger value="env" className="text-xs py-1 px-2 h-7">
                        Config
                      </TabsTrigger>
                      <TabsTrigger value="decks" className="text-xs py-1 px-2 h-7">
                        Decks
                      </TabsTrigger>
                      {routes.length > 0 && (
                        <TabsTrigger value="nav" className="text-xs py-1 px-2 h-7">
                          Routes
                        </TabsTrigger>
                      )}
                    </TabsList>

                    <div className="flex-grow overflow-hidden">
                      <TabsContent value="reading" className="h-full m-0">
                        <ReadingLogsTab />
                      </TabsContent>
                      
                      <TabsContent value="webhooks" className="h-full m-0">
                        <WebhookLogTab />
                      </TabsContent>

                      <TabsContent value="logs" className="h-full m-0">
                        <ConnectionLogsTab />
                      </TabsContent>

                      <TabsContent value="debug" className="m-0">
                        <DebugTab />
                      </TabsContent>

                      <TabsContent value="wallet" className="m-0 p-4">
                        <WalletTab />
                      </TabsContent>

                      <TabsContent value="env" className="m-0 p-4">
                        <ConfigTab />
                      </TabsContent>

                      <TabsContent value="decks" className="m-0 p-4">
                        <DecksTab />
                      </TabsContent>

                      {routes.length > 0 && (
                        <TabsContent value="nav" className="m-0 p-4">
                          <RoutesTab routes={routes} />
                        </TabsContent>
                      )}
                    </div>
                  </Tabs>
                </div>
              </Resizable>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default DevToolPanel;
