
import React, { useEffect, useState } from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/types/tarot';

interface ReadingLog {
  timestamp: string;
  phase: string;
  message: string;
  data?: any;
}

const ReadingLogsTab = () => {
  const { 
    phase,
    intention,
    selectedDeck,
    selectedCards,
    availableCards,
    webhookResponse
  } = useTarot();

  const [logs, setLogs] = useState<ReadingLog[]>([]);

  const addLog = (message: string, data?: any) => {
    setLogs(prev => [
      {
        timestamp: new Date().toISOString(),
        phase: phase,
        message,
        data
      },
      ...prev
    ]);
  };

  // Log phase changes
  useEffect(() => {
    addLog(`Phase changed to: ${phase}`);
  }, [phase]);

  // Log intention changes
  useEffect(() => {
    if (intention) {
      addLog(`User set intention: "${intention}"`);
    }
  }, [intention]);

  // Log deck selection
  useEffect(() => {
    addLog(`Selected deck: ${selectedDeck}`);
  }, [selectedDeck]);

  // Log card selection
  useEffect(() => {
    if (selectedCards.length > 0) {
      addLog(`Selected cards updated`, {
        totalSelected: selectedCards.length,
        cards: selectedCards.map(card => ({
          id: card.id,
          name: card.name,
          revealed: card.revealed,
          deck: card.deck
        }))
      });
    }
  }, [selectedCards]);

  // Log webhook responses
  useEffect(() => {
    if (webhookResponse) {
      addLog(`Received webhook response`, {
        selectedCards: webhookResponse.selected_cards,
        message: webhookResponse.message,
        isTemporary: webhookResponse.isTemporary
      });
    }
  }, [webhookResponse]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Current Reading Status</h3>
        <Badge variant="outline" className="bg-amber-50">{phase}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs font-medium">Selected Deck</p>
          <Badge variant="outline" className="bg-blue-50">{selectedDeck}</Badge>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-medium">Cards Selected</p>
          <Badge variant="outline" className="bg-green-50">
            {selectedCards.length}/3
          </Badge>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-2">Reading Logs</h3>
        <ScrollArea className="h-[400px] rounded border p-2">
          {logs.map((log, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-1 py-0"
                >
                  {log.phase}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{log.message}</p>
              {log.data && (
                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ReadingLogsTab;
