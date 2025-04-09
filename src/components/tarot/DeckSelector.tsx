
import React, { useState, useEffect } from 'react';
import { useTarot, Deck } from '@/contexts/TarotContext';
import { useWallet } from '@/contexts/WalletContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import { AlertTriangle, LockIcon } from 'lucide-react';
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
    { id: 'deck2', name: t('tarot.deck2Name'), available: false },
    { id: 'deck3', name: 'Crypto Memes', available: false },
    { id: 'deck4', name: 'NFT Art', available: false },
    { id: 'deck5', name: 'Future Finance', available: false }
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
          // Preserve our 5 deck structure but update availability from API
          let apiDecks = data.decks.map((deck: any) => ({
            id: deck.id || 'deck1',
            name: deck.name || t('tarot.defaultDeckName'),
            available: deck.available !== false
          }));
          
          // Ensure we always have 5 decks
          if (apiDecks.length < 5) {
            const existingIds = apiDecks.map(d => d.id);
            availableDecks.forEach(defaultDeck => {
              if (!existingIds.includes(defaultDeck.id)) {
                apiDecks.push({...defaultDeck, available: false});
              }
            });
          }
          
          setAvailableDecks(apiDecks.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching decks:', error);
        setDecksError(true);
        // Default to deck1 when there's an error
        setSelectedDeck('deck1');
        toast.error(t('errors.deckLoadFailed'), {
          position: 'bottom-center',
          className: 'subtle-toast',
        });
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
        <h3 className="text-lg font-medium mb-4 text-center text-gray-800">
          {t('tarot.selectDeck')}
        </h3>
        
        {decksError && (
          <div className="text-amber-600 text-sm bg-amber-50 border border-amber-200 rounded mb-4 p-2 flex items-center justify-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>{t('errors.deckLoadFailedTitle')}</span>
          </div>
        )}
        
        <RadioGroup
          value={selectedDeck}
          onValueChange={handleDeckChange}
          className="grid grid-cols-3 gap-4"
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
                  ${selectedDeck === deck.id ? 'ring-2 ring-amber-500' : 'ring-1 ring-gray-200'}
                  ${deck.available ? 'bg-gradient-to-br from-amber-700 to-amber-500' : 'bg-gray-300'}
                  rounded-lg shadow-sm
                `}>
                  {deck.id === 'deck1' && (
                    <img 
                      src="/img/cards/carddeck1/deck1_0_TheDegen.png"
                      alt={deck.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-20"
                    />
                  )}
                  
                  {!deck.available && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
                      <LockIcon className="w-8 h-8 text-white/70 mb-1" />
                      <span className="text-white font-medium text-xs">{t('tarot.comingSoon')}</span>
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <h4 className="text-white font-medium text-xs">{deck.name}</h4>
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
