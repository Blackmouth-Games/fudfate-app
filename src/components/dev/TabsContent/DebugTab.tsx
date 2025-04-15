
import React, { useEffect, useState } from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash } from 'lucide-react';
import tarotCards from '@/data/tarotCards';

const DebugTab = () => {
  const { webhookResponse, selectedCards, selectedDeck, phase } = useTarot();
  const [webhookCards, setWebhookCards] = useState<number[]>([]);
  const [parsedWebhook, setParsedWebhook] = useState<any>(null);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);
  
  const clearWebhookCache = () => {
    // Reset the lastCallTimestamp in core.ts
    if (typeof window !== 'undefined') {
      // Clear any cached webhook data
      const lastWebhookCalls = {};
      // @ts-ignore - Accessing global variable
      window.lastWebhookCalls = lastWebhookCalls;
    }
    
    // Clear local webhook logs
    try {
      localStorage.removeItem('webhook_logs');
    } catch (e) {
      console.error('Failed to clear webhook logs:', e);
    }
    
    toast.success('Webhook cache cleared');
  };
  
  useEffect(() => {
    if (webhookResponse) {
      console.log("Debug tab processing webhook response:", webhookResponse);
      
      let tempWebhookCards: number[] = [];
      let tempMessage: string | null = null;
      let tempParsedWebhook: any = null;
      
      // Try to parse the webhook response
      try {
        // First try to get selected_cards directly from the response
        if (Array.isArray(webhookResponse.selected_cards)) {
          tempWebhookCards = webhookResponse.selected_cards;
          console.log("Found selected_cards directly in webhook object:", tempWebhookCards);
        }
        
        // Try to get message directly
        if (webhookResponse.message) {
          tempMessage = webhookResponse.message;
        }
        
        // Try to parse returnwebhoock if it exists
        if (typeof webhookResponse.returnwebhoock === 'string') {
          try {
            const parsed = JSON.parse(webhookResponse.returnwebhoock);
            tempParsedWebhook = parsed;
            
            if (!tempMessage && parsed.message) {
              tempMessage = parsed.message;
            }
            
            if (Array.isArray(parsed.selected_cards)) {
              tempWebhookCards = parsed.selected_cards;
              console.log("Found selected_cards in parsed webhook:", tempWebhookCards);
            }
          } catch (error) {
            console.error("Error parsing webhook in debug tab:", error);
          }
        }
      } catch (error) {
        console.error("General error processing webhook in debug tab:", error);
      }
      
      // Set state after processing all data
      setWebhookCards(tempWebhookCards);
      setWebhookMessage(tempMessage);
      setParsedWebhook(tempParsedWebhook);
    }
  }, [webhookResponse]);
  
  const getCardInfoById = (id: string) => {
    return tarotCards.find(card => card.id === id);
  };
  
  const getCardInfoByIndex = (index: number, deck: string) => {
    const deckCards = tarotCards.filter(card => card.deck === deck);
    return index >= 0 && index < deckCards.length ? deckCards[index] : null;
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Current Phase</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={clearWebhookCache}
          className="h-7 text-xs flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
        >
          <Trash className="h-3 w-3" />
          Clear Cache
        </Button>
      </div>
      <Badge variant="outline" className="bg-amber-50">{phase}</Badge>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-semibold mb-2">Selected Deck</h3>
        <Badge variant="outline" className="bg-blue-50">{selectedDeck}</Badge>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-semibold mb-2">Webhook Message</h3>
        {webhookMessage ? (
          <div className="p-2 bg-amber-50 border border-amber-200 rounded text-sm">
            {webhookMessage}
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">No message in webhook response</div>
        )}
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-semibold mb-2">Revealed Cards</h3>
        {selectedCards.length > 0 ? (
          <ScrollArea className="h-28 rounded border p-2">
            {selectedCards.map((card, index) => (
              <div key={`selected-${index}`} className="mb-2 last:mb-0 flex items-center gap-2">
                <Badge 
                  variant={card.revealed ? "default" : "outline"}
                  className={card.revealed ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                >
                  Card {index + 1}
                </Badge>
                <span className="text-xs">
                  {card.id} - {card.name} - {card.deck || selectedDeck}
                </span>
              </div>
            ))}
          </ScrollArea>
        ) : (
          <div className="text-xs text-gray-500 italic">No cards selected yet</div>
        )}
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-semibold mb-2">Webhook Selected Cards</h3>
        {webhookCards.length > 0 ? (
          <ScrollArea className="h-28 rounded border p-2">
            {webhookCards.map((cardIndex, index) => {
              const webhookCard = getCardInfoByIndex(cardIndex, selectedDeck);
              const selectedCardAtIndex = selectedCards[index];
              const isMatch = webhookCard && selectedCardAtIndex && webhookCard.id === selectedCardAtIndex.id;
              
              return (
                <div key={`webhook-${index}`} className="mb-2 last:mb-0">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={isMatch ? "bg-green-100 text-green-800 border-green-300" : 
                              (selectedCardAtIndex?.revealed ? "bg-yellow-100 text-yellow-800 border-yellow-300" : "")}
                    >
                      Card {index + 1} (Index: {cardIndex})
                    </Badge>
                    {webhookCard && (
                      <span className="text-xs">
                        {webhookCard.id} - {webhookCard.name} - {webhookCard.deck}
                      </span>
                    )}
                  </div>
                  
                  {selectedCardAtIndex && selectedCardAtIndex.revealed && (
                    <div className="ml-6 mt-1 text-xs">
                      <span className={isMatch ? "text-green-600" : "text-amber-600"}>
                        {isMatch ? "✓ Matches revealed card" : "⚠ Doesn't match revealed card: " + selectedCardAtIndex.name + " (" + (selectedCardAtIndex.deck || selectedDeck) + ")"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </ScrollArea>
        ) : (
          <div className="text-xs text-gray-500 italic">No cards in webhook response</div>
        )}
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-semibold mb-2">Webhook Data</h3>
        {parsedWebhook ? (
          <ScrollArea className="h-40 rounded border p-2">
            <pre className="text-xs">{JSON.stringify(parsedWebhook, null, 2)}</pre>
          </ScrollArea>
        ) : (
          <div className="text-xs text-gray-500 italic">No parsed webhook data</div>
        )}
      </div>
    </div>
  );
};

export default DebugTab;
