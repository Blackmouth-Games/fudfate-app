import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import GlitchText from '@/components/GlitchText';
import { Dialog, DialogContent, DialogTitle, DialogClose, DialogHeader } from '@/components/ui/dialog';
import { X, LockIcon } from 'lucide-react';
import tarotCards from '@/data/tarotCards';
import { DeckInfo, getAvailableDecks } from '@/utils/deck-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useTarot } from '@/contexts/TarotContext';
import { Deck } from '@/types/tarot';

interface DeckSelectorProps {
  className?: string;
  availableDecks?: DeckInfo[];
  isLoading?: boolean;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({ 
  className = '', 
  availableDecks = [], 
  isLoading = false 
}) => {
  const { t } = useTranslation();
  const { selectedDeck, setSelectedDeck } = useTarot();
  const [openDeckId, setOpenDeckId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  
  // Get decks from props if available, otherwise use default decks
  const decks = availableDecks.length > 0 ? availableDecks : getAvailableDecks();

  const handleSelectDeck = (deckId: string) => {
    // Only allow selecting unlocked decks
    const deck = decks.find(d => d.id === deckId);
    if (deck && deck.unlocked) {
      // Convert the string to the Deck type before passing to setSelectedDeck
      setSelectedDeck(deckId as Deck);
    }
  };

  const openDeckDetails = (deckId: string) => {
    const deck = decks.find(d => d.id === deckId);
    if (deck && deck.unlocked) {
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

  // Loading state
  if (isLoading) {
    return (
      <Card className={`border-amber-400/50 shadow-md ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <Skeleton className="h-7 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="w-full max-w-[120px] h-[170px] mx-auto rounded-lg" />
                <Skeleton className="h-4 w-24 mt-2" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
                  src={deck.backImage} 
                  alt={deck.displayName} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to a default image if the path is incorrect
                    e.currentTarget.src = "/img/cards/deck1/99_back.png";
                  }}
                />
                {!deck.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-black bg-opacity-50 px-2 py-1 rounded flex items-center gap-1">
                      <LockIcon className="h-3 w-3 text-white" />
                      <span className="text-white font-medium text-sm">
                        {t('tarot.locked')}
                      </span>
                    </div>
                  </div>
                )}
                {selectedDeck === deck.id && (
                  <div className="absolute top-1 right-1 bg-amber-500 w-3 h-3 rounded-full border border-white"></div>
                )}
              </div>
              <h4 className="mt-2 text-center text-sm font-medium">
                {deck.displayName}
              </h4>
              {selectedDeck === deck.id && (
                <span className="text-xs text-amber-600 font-medium">
                  {t('tarot.selected')}
                </span>
              )}
              {!deck.unlocked && (
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
              <GlitchText text={decks.find(d => d.id === openDeckId)?.displayName || ''} />
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
                    onError={(e) => {
                      // Fallback to a default image if the path is incorrect
                      e.currentTarget.src = "/img/cards/deck1/0_TheDegen.png";
                    }}
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
                      onError={(e) => {
                        // Fallback to a default image if the path is incorrect
                        e.currentTarget.src = "/img/cards/deck1/0_TheDegen.png";
                      }}
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
