
import React, { useState, useEffect } from 'react';
import { useTarot, Deck } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, X, LockIcon } from 'lucide-react';
import { useEnvironment } from '@/hooks/useEnvironment';
import { toast } from 'sonner';

interface DeckSelectorProps {
  className?: string;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({ className = '' }) => {
  const { selectedDeck, setSelectedDeck } = useTarot();
  const { t } = useTranslation();
  const { connected, userData } = useWallet();
  const { webhooks } = useEnvironment();
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [decksError, setDecksError] = useState(false);
  const [availableDecks, setAvailableDecks] = useState<{id: string, name: string, available: boolean}[]>([
    { id: 'deck1', name: t('tarot.deck1Name'), available: true },
    { id: 'deck2', name: t('tarot.deck2Name'), available: false }
  ]);

  useEffect(() => {
    const fetchDecks = async () => {
      if (!connected || !userData?.userId) return;
      
      setLoadingDecks(true);
      setDecksError(false);
      
      try {
        const response = await fetch(webhooks.deck, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: new Date().toISOString(),
            userid: userData.userId
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Deck webhook response:', data);
        
        if (data && Array.isArray(data.decks)) {
          setAvailableDecks(data.decks.map((deck: any) => ({
            id: deck.id || 'deck1',
            name: deck.name || t('tarot.defaultDeckName'),
            available: deck.available !== false
          })));
        }
      } catch (error) {
        console.error('Error fetching decks:', error);
        setDecksError(true);
        // Default to deck1 when there's an error
        setSelectedDeck('deck1');
        toast.error(t('errors.deckLoadFailed'));
      } finally {
        setLoadingDecks(false);
      }
    };
    
    fetchDecks();
  }, [connected, userData, webhooks.deck, t]);

  const handleDeckChange = (value: string) => {
    setSelectedDeck(value as Deck);
  };

  return (
    <Card className={`border-amber-400/50 shadow-md ${className}`}>
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-4 text-center text-gray-800">
          {t('tarot.selectDeck')}
        </h3>
        
        {decksError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('errors.deckLoadFailedTitle')}</AlertTitle>
            <AlertDescription>{t('errors.deckLoadFailedDescription')}</AlertDescription>
          </Alert>
        )}
        
        <RadioGroup
          value={selectedDeck}
          onValueChange={handleDeckChange}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {availableDecks.map((deck) => (
            <div 
              key={deck.id}
              className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
                deck.available ? 'hover:shadow-xl' : 'opacity-70'
              }`}
            >
              <input 
                type="radio" 
                id={deck.id} 
                name="deck" 
                value={deck.id} 
                className="sr-only"
                checked={selectedDeck === deck.id}
                onChange={() => deck.available && handleDeckChange(deck.id)}
                disabled={!deck.available}
              />
              <label 
                htmlFor={deck.id}
                className={`block cursor-pointer h-full ${!deck.available && 'cursor-not-allowed'}`}
              >
                <div className={`
                  aspect-[2/3] relative overflow-hidden 
                  ${selectedDeck === deck.id ? 'ring-4 ring-amber-500' : 'ring-1 ring-gray-200'}
                  ${deck.available ? 'bg-gradient-to-br from-amber-800 to-amber-500' : 'bg-gray-300'}
                  rounded-lg shadow-md
                `}>
                  {deck.id === 'deck1' ? (
                    <img 
                      src="/img/cards/carddeck1/deck1_0_TheDegen.png"
                      alt={deck.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-20"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-500 opacity-50" />
                  )}
                  
                  {!deck.available && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
                      <LockIcon className="w-12 h-12 text-white/70 mb-2" />
                      <span className="text-white font-bold text-lg">{t('tarot.comingSoon')}</span>
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <h4 className="text-white font-bold text-lg">{deck.name}</h4>
                  </div>
                </div>
              </label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default DeckSelector;
