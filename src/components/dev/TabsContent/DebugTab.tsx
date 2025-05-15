import React, { useEffect, useState } from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash, Download, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import tarotCards from '@/data/tarotCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DownloadHistoryEntry, HistoryViewingCard } from '@/types/debug';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useWallet } from '@/contexts/WalletContext';
import { fetchAvailableDecks } from '@/utils/wallet-connection-utils';

// Initialize the download history if it doesn't exist
if (typeof window !== 'undefined') {
  window.imageDownloadHistory = window.imageDownloadHistory || [];
  window.historyViewingCards = window.historyViewingCards || [];
}

const DebugTab = () => {
  const { webhookResponse, selectedCards, selectedDeck, phase, revealedCardIds } = useTarot();
  const { webhooks, environment } = useEnvironment();
  const { userData } = useWallet();
  const [webhookCards, setWebhookCards] = useState<number[]>([]);
  const [parsedWebhook, setParsedWebhook] = useState<any>(null);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryEntry[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  
  // Load download history on mount and update when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDownloadHistory(window.imageDownloadHistory || []);
      
      // Set up listener for history updates
      const handleHistoryUpdate = () => {
        setDownloadHistory([...window.imageDownloadHistory]);
      };
      
      window.addEventListener('imageDownloadHistoryUpdate', handleHistoryUpdate);
      return () => {
        window.removeEventListener('imageDownloadHistoryUpdate', handleHistoryUpdate);
      };
    }
  }, []);

  const clearWebhookCache = () => {
    if (typeof window !== 'undefined') {
      const lastWebhookCalls = {};
      window.lastWebhookCalls = lastWebhookCalls;
    }
    
    try {
      localStorage.removeItem('webhook_logs');
    } catch (e) {
      console.error('Failed to clear webhook logs:', e);
    }
    
    toast.success('Webhook cache cleared');
  };

  const clearDownloadHistory = () => {
    if (typeof window !== 'undefined') {
      window.imageDownloadHistory = [];
      setDownloadHistory([]);
      toast.success('Download history cleared');
    }
  };
  
  useEffect(() => {
    if (webhookResponse) {
      console.log("Debug tab processing webhook response:", webhookResponse);
      
      let tempWebhookCards: number[] = [];
      let tempMessage: string | null = null;
      let tempParsedWebhook: any = null;
      
      try {
        if (Array.isArray(webhookResponse.selected_cards)) {
          tempWebhookCards = webhookResponse.selected_cards;
        }
        
        if (webhookResponse.message) {
          tempMessage = webhookResponse.message;
        }
        
        if (typeof webhookResponse.returnwebhoock === 'string') {
          try {
            const parsed = JSON.parse(webhookResponse.returnwebhoock);
            tempParsedWebhook = parsed;
            
            if (!tempMessage && parsed.message) {
              tempMessage = parsed.message;
            }
            
            if (Array.isArray(parsed.selected_cards)) {
              tempWebhookCards = parsed.selected_cards;
            }
          } catch (error) {
            console.error("Error parsing webhook in debug tab:", error);
          }
        }
      } catch (error) {
        console.error("General error processing webhook in debug tab:", error);
      }
      
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

  const renderCardTable = (title: string, cards: any[], type: 'selected' | 'webhook' | 'history') => {
    if (!cards || cards.length === 0) return null;

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Card ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Image Path</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card, index) => {
                let cardInfo;
                let cardId;
                let cardName;
                let imagePath;
                let status = [];

                switch (type) {
                  case 'selected':
                    cardId = card.id;
                    cardName = card.name;
                    imagePath = card.image;
                    if (imagePath && imagePath.endsWith('.png')) {
                      imagePath = imagePath.replace('.png', '.jpg');
                    }
                    if (revealedCardIds.includes(card.id)) status.push('Revealed');
                    break;
                  case 'webhook':
                    cardInfo = getCardInfoByIndex(card, selectedDeck);
                    cardId = card;
                    cardName = cardInfo?.name || `Card ${card}`;
                    imagePath = cardInfo?.image || 'Not found';
                    if (imagePath && imagePath.endsWith('.png')) {
                      imagePath = imagePath.replace('.png', '.jpg');
                    }
                    status.push('From Webhook');
                    break;
                  case 'history':
                    cardId = card.id;
                    cardName = card.name;
                    imagePath = card.image;
                    if (imagePath && imagePath.endsWith('.png')) {
                      imagePath = imagePath.replace('.png', '.jpg');
                    }
                    status.push('Historical');
                    break;
                }

                return (
                  <TableRow key={`${type}-${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{cardId}</TableCell>
                    <TableCell>{cardName}</TableCell>
                    <TableCell className="font-mono text-xs">{imagePath}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {status.map((s: string) => (
                          <Badge key={s} variant="outline">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  const handleFetchDecks = async () => {
    if (!userData?.userId) {
      toast.error('No hay usuario conectado');
      return;
    }

    setIsLoadingDecks(true);
    try {
      const decksData = await fetchAvailableDecks(webhooks.deck, userData.userId, environment);
      console.log('Decks webhook response:', decksData);
      toast.success('Decks obtenidos exitosamente');
    } catch (error) {
      console.error('Error fetching decks:', error);
      toast.error('Error al obtener los decks');
    } finally {
      setIsLoadingDecks(false);
    }
  };

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4 p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold">Current Phase</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFetchDecks}
              disabled={isLoadingDecks}
              className="h-7 text-xs flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingDecks ? 'animate-spin' : ''}`} />
              Fetch Decks
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearDownloadHistory}
              className="h-7 text-xs flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
            >
              <Download className="h-3 w-3" />
              Clear Downloads
            </Button>
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
          <h3 className="text-sm font-semibold mb-2">Cards Information</h3>
          
          {renderCardTable("User Selected Cards", selectedCards, 'selected')}
          {renderCardTable("Webhook Response Cards", webhookCards, 'webhook')}
          {renderCardTable("History Item Cards", window.historyViewingCards || [], 'history')}
          
          {parsedWebhook && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Raw Webhook Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                  {JSON.stringify(parsedWebhook, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold mb-2">Image Download History</h3>
          <Card>
            <CardContent className="p-4">
              {downloadHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Image URL</TableHead>
                      <TableHead className="min-w-[200px]">Cards</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {downloadHistory.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-xs">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-[150px] truncate">
                          {entry.url}
                        </TableCell>
                        <TableCell className="text-xs">
                          {entry.intention && (
                            <div className="text-amber-600 mb-1">
                              Question: {entry.intention}
                            </div>
                          )}
                          {entry.cards?.map((card, i) => (
                            <div key={i} className="text-gray-600">
                              {card.name}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className={entry.source === 'history' ? "bg-amber-50" : "bg-blue-50"}>
                            {entry.source === 'history' ? "History" : "Reading"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {entry.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-xs text-gray-500 italic text-center py-4">
                  No image downloads recorded
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
};

export default DebugTab;