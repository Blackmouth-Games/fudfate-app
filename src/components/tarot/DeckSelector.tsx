
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import GlitchText from '@/components/GlitchText';
import { Dialog, DialogContent, DialogTitle, DialogClose, DialogHeader } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import tarotCards from '@/data/tarotCards';

interface DeckSelectorProps {
  className?: string;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [selectedDeck, setSelectedDeck] = useState<string>('deck1');
  const [openDeckId, setOpenDeckId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  
  // Card back image
  const cardBackImage = "/img/cards/carddeck1/card_back.jpg";
  const deckBackImage = "/img/cards/carddeck1/deck1_back.png";

  // Mock decks - in a real app, this would come from your backend
  const decks = [
    { id: 'deck1', name: 'Crypto Classics', image: deckBackImage, unlocked: true },
    { id: 'deck2', name: 'DeFi Destinies', image: deckBackImage, unlocked: false },
    { id: 'deck3', name: 'NFT Narratives', image: deckBackImage, unlocked: false },
    { id: 'deck4', name: 'Meme Magic', image: deckBackImage, unlocked: false },
    { id: 'deck5', name: 'Web3 Wonders', image: deckBackImage, unlocked: false }
  ];

  const handleSelectDeck = (deckId: string) => {
    // Only allow selecting the unlocked deck
    if (deckId === 'deck1') {
      setSelectedDeck(deckId);
    }
  };

  const openDeckDetails = (deckId: string) => {
    if (deckId === 'deck1') {
      setOpenDeckId(deckId);
    }
  };

  const closeDeckDetails = () => {
    setOpenDeckId(null);
  };
  
  // Function to view a specific card
  const viewCard = (cardId: string) => {
    setSelectedCard(cardId);
  };
  
  const closeCardView = () => {
    setSelectedCard(null);
  };

  // Filter cards for the selected deck
  const deckCards = tarotCards.filter(card => card.deck === openDeckId);
  
  // Find the selected card details
  const cardDetails = selectedCard ? 
    deckCards.find(card => card.id === selectedCard) : null;

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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <div key={deck.id} className="flex flex-col items-center">
              <div 
                className={`relative cursor-pointer border-2 rounded-lg overflow-hidden shadow-md transition-all w-full max-w-[120px] h-[170px] mx-auto
                  ${selectedDeck === deck.id ? 'border-amber-500 shadow-amber-200' : 'border-gray-200'}
                  ${!deck.unlocked ? 'opacity-50 grayscale' : 'hover:shadow-lg hover:border-amber-300'}`}
                onClick={() => {
                  handleSelectDeck(deck.id);
                  if (deck.unlocked) {
                    openDeckDetails(deck.id);
                  }
                }}
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

      {/* Dialog to show all cards in a deck */}
      <Dialog open={!!openDeckId} onOpenChange={(open) => !open && closeDeckDetails()}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <GlitchText text={openDeckId === 'deck1' ? 'Crypto Classics' : ''} />
              <DialogClose className="h-6 w-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
                <X className="h-4 w-4" />
                <span className="sr-only">{t('common.close')}</span>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
            {deckCards.map((card) => (
              <div 
                key={card.id} 
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                onClick={() => viewCard(card.id)}
              >
                <div className="border-2 border-amber-300 rounded-lg overflow-hidden shadow-md w-full aspect-[2/3]">
                  <img 
                    src={card.image} 
                    alt={card.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h5 className="mt-2 text-center text-xs font-medium">{card.name}</h5>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for individual card view */}
      <Dialog open={!!selectedCard} onOpenChange={(open) => !open && closeCardView()}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <GlitchText text={cardDetails?.name || ''} className="text-xl" />
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogHeader>
          <div className="p-4 flex flex-col items-center">
            {cardDetails && (
              <>
                <div className="mb-4 w-full max-w-xs mx-auto">
                  <div className="aspect-[2/3] overflow-hidden rounded-lg border-2 border-amber-400 shadow-lg">
                    <img 
                      src={cardDetails.image} 
                      alt={cardDetails.name} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-amber-200 mt-4 w-full">
                  <h4 className="font-bold mb-2 text-amber-700">{cardDetails.name}</h4>
                  <p className="text-gray-700">{cardDetails.description}</p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DeckSelector;
