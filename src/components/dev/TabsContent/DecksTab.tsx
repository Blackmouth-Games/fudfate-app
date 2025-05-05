import React, { useState, useEffect } from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useEnvironment } from '@/hooks/useEnvironment';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, ExternalLink, Info, CheckCircle, XCircle } from 'lucide-react';
import { getAllDecks, checkImageAvailability, getCardBackPath } from '@/utils/deck-utils';
import tarotCards from '@/data/tarotCards';

const DecksTab = () => {
  const { selectedDeck } = useTarot();
  const { environment } = useEnvironment();
  const [availableDecks, setAvailableDecks] = useState(getAllDecks());
  const [deckImageStatus, setDeckImageStatus] = useState<Record<string, Record<string, boolean>>>({});
  const [refreshing, setRefreshing] = useState(false);

  // Log selectedDeck for debugging
  console.log('[DecksTab] selectedDeck from context:', selectedDeck);

  // Check for image availability
  const refreshDeckStatus = async () => {
    setRefreshing(true);
    const deckStatus: Record<string, Record<string, boolean>> = {};

    // Get all decks and check each
    const decks = getAllDecks();
    
    for (const deck of decks) {
      deckStatus[deck.name] = {};
      
      // Check back card
      const backImagePath = deck.backImage;
      deckStatus[deck.name]['backCard'] = await checkImageAvailability(backImagePath);
      
      // Check a sample of cards from the deck
      const cardsForDeck = tarotCards.filter(card => card.deck === deck.name);
      if (cardsForDeck.length > 0) {
        // Sample first and last card
        const firstCard = cardsForDeck[0];
        const lastCard = cardsForDeck[cardsForDeck.length - 1];
        
        deckStatus[deck.name]['firstCard'] = await checkImageAvailability(firstCard.image);
        deckStatus[deck.name]['lastCard'] = await checkImageAvailability(lastCard.image);
      }
    }
    
    setDeckImageStatus(deckStatus);
    setRefreshing(false);
  };

  // Load initial status
  useEffect(() => {
    refreshDeckStatus();
  }, []);

  const getSelectedDeckName = (deckId: string) => {
    const deck = availableDecks.find((d) => d.name === deckId);
    return deck ? deck.displayName : deckId;
  };
  
  const getCorrectBackPath = (deckId: string) => {
    return getCardBackPath(deckId as any);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Decks Information</h3>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-6 text-xs" 
          onClick={refreshDeckStatus}
          disabled={refreshing}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-xs flex items-center">
            <Info className="h-3 w-3 mr-1" />
            Selected Deck: <span className="font-bold ml-1">{getSelectedDeckName(selectedDeck)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 text-xs">
          <div className="text-xs mb-1 flex">
            <span className="font-medium w-24">Deck ID:</span> 
            <span className="font-mono">{selectedDeck}</span>
          </div>
          <div className="text-xs mb-1 flex">
            <span className="font-medium w-24">Back Image Path:</span> 
            <span className="font-mono break-all">{getCorrectBackPath(selectedDeck)}</span>
          </div>
          <div className="text-xs mb-1 flex">
            <span className="font-medium w-24">Environment:</span>
            <span className={environment === 'production' ? 'text-green-600' : 'text-amber-600'}>
              {environment}
            </span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h4 className="text-xs font-medium mb-2">Available Decks</h4>
        <Table className="border rounded-md">
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px]">Name</TableHead>
              <TableHead className="text-[10px]">Directory</TableHead>
              <TableHead className="text-[10px]">Back Card</TableHead>
              <TableHead className="text-[10px]">Cards Check</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {availableDecks.map((deck) => (
              <TableRow key={deck.id} className={selectedDeck === deck.name ? 'bg-amber-50' : ''}>
                <TableCell className="py-1 text-[10px]">
                  {deck.displayName}
                  {selectedDeck === deck.name && (
                    <span className="ml-1 text-[8px] bg-amber-200 px-1 py-0.5 rounded text-amber-800">Selected</span>
                  )}
                </TableCell>
                <TableCell className="py-1 text-[10px] font-mono">{deck.directory}</TableCell>
                <TableCell className="py-1 text-[10px]">
                  {deckImageStatus[deck.name]?.backCard ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                </TableCell>
                <TableCell className="py-1 text-[10px]">
                  {deckImageStatus[deck.name]?.firstCard && deckImageStatus[deck.name]?.lastCard ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-[10px] text-gray-500 italic">
        <p>Note: Card paths should be in format: "/img/cards/deck_1/0_TheDegen.png"</p>
        <p>Back card paths should be in format: "/img/cards/deck_1/99_BACK.png"</p>
      </div>
    </div>
  );
};

export default DecksTab;
