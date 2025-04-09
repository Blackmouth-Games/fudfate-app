
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import GlitchText from '@/components/GlitchText';

interface DeckSelectorProps {
  className?: string;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [selectedDeck, setSelectedDeck] = useState<string>('deck1');

  // Mock decks - in a real app, this would come from your backend
  const decks = [
    { id: 'deck1', name: 'Crypto Classics', image: '/img/cards/carddeck1/deck1_0_TheDegen.png', unlocked: true },
    { id: 'deck2', name: 'DeFi Destinies', image: '/img/cards/carddeck1/deck1_1_TheMiner.png', unlocked: false },
    { id: 'deck3', name: 'NFT Narratives', image: '/img/cards/carddeck1/deck1_3_TheWhale.png', unlocked: false },
    { id: 'deck4', name: 'Meme Magic', image: '/img/cards/carddeck1/deck1_19_TheMemecoin.png', unlocked: false },
    { id: 'deck5', name: 'Web3 Wonders', image: '/img/cards/carddeck1/deck1_21_TheDAO.png', unlocked: false }
  ];

  const handleSelectDeck = (deckId: string) => {
    // Only allow selecting the unlocked deck
    if (deckId === 'deck1') {
      setSelectedDeck(deckId);
    }
  };

  return (
    <Card className={`border-amber-400/50 shadow-md ${className}`}>
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-center text-gray-800 mb-1">
            <GlitchText text={t('tarot.selectDeck')} />
          </h3>
          <p className="text-gray-600 text-xs">
            {t('tarot.additionalDecksComingSoon')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <div key={deck.id} className="flex flex-col items-center">
              <div 
                className={`relative cursor-pointer border-2 rounded-lg overflow-hidden shadow-md transition-all w-full max-w-[160px] h-[220px] mx-auto
                  ${selectedDeck === deck.id ? 'border-amber-500 shadow-amber-200' : 'border-gray-200'}
                  ${!deck.unlocked ? 'opacity-50 grayscale' : 'hover:shadow-lg hover:border-amber-300'}`}
                onClick={() => handleSelectDeck(deck.id)}
              >
                <img 
                  src={deck.image} 
                  alt={deck.name} 
                  className="w-full h-full object-cover"
                />
                {!deck.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <span className="text-white font-medium text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                      {t('tarot.locked')}
                    </span>
                  </div>
                )}
              </div>
              <h4 className="mt-2 text-center text-sm font-medium">
                {deck.name}
              </h4>
              {deck.id === 'deck1' && (
                <span className="text-xs text-amber-600 font-medium">
                  {t('tarot.selected')}
                </span>
              )}
              {deck.id !== 'deck1' && (
                <span className="text-xs text-gray-400 italic">
                  {t('tarot.comingSoon')}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeckSelector;
