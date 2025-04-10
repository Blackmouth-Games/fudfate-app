
import React, { useEffect, useState } from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import tarotCards from '@/data/tarotCards';

const DebugTab = () => {
  const { webhookResponse, selectedCards, selectedDeck, phase } = useTarot();
  const [webhookCards, setWebhookCards] = useState<number[]>([]);
  const [parsedWebhook, setParsedWebhook] = useState<any>(null);
  
  useEffect(() => {
    if (webhookResponse) {
      // Try to parse the webhook response
      try {
        if (typeof webhookResponse.returnwebhoock === 'string') {
          const parsed = JSON.parse(webhookResponse.returnwebhoock);
          setParsedWebhook(parsed);
          
          if (Array.isArray(parsed.selected_cards)) {
            setWebhookCards(parsed.selected_cards);
          }
        } else if (Array.isArray(webhookResponse.selected_cards)) {
          setWebhookCards(webhookResponse.selected_cards);
        }
      } catch (error) {
        console.error("Error parsing webhook in debug tab:", error);
      }
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
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Current Phase</h3>
        <Badge variant="outline" className="bg-amber-50">{phase}</Badge>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-semibold mb-2">Selected Deck</h3>
        <Badge variant="outline" className="bg-blue-50">{selectedDeck}</Badge>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-semibold mb-2">Revealed Cards</h3>
        {selectedCards.length > 0 ? (
          <ScrollArea className="h-28 rounded border p-2">
            {selectedCards.map((card, index) => (
              <div key={index} className="mb-2 last:mb-0 flex items-center gap-2">
                <Badge 
                  variant={card.revealed ? "default" : "outline"}
                  className={card.revealed ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                >
                  Card {index + 1}
                </Badge>
                <span className="text-xs">
                  {card.id} - {card.name}
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
                <div key={index} className="mb-2 last:mb-0">
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
                        {webhookCard.id} - {webhookCard.name}
                      </span>
                    )}
                  </div>
                  
                  {selectedCardAtIndex && selectedCardAtIndex.revealed && (
                    <div className="ml-6 mt-1 text-xs">
                      <span className={isMatch ? "text-green-600" : "text-amber-600"}>
                        {isMatch ? "✓ Matches revealed card" : "⚠ Doesn't match revealed card: " + selectedCardAtIndex.name}
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
