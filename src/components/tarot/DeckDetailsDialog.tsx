
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogClose, DialogHeader } from '@/components/ui/dialog';
import { X, Info } from 'lucide-react';
import GlitchText from '@/components/GlitchText';
import { DeckInfo } from '@/utils/deck-utils';
import tarotCards from '@/data/tarotCards';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface DeckDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: string | null;
  decks: DeckInfo[];
  deckCards: any[];
  onCardClick: (cardId: string) => void;
  t: (key: string) => string;
}

const DeckDetailsDialog: React.FC<DeckDetailsDialogProps> = ({
  open,
  onOpenChange,
  deckId,
  decks,
  deckCards,
  onCardClick,
  t
}) => {
  const selectedDeck = decks.find(d => d.id === deckId);
  
  // If no cards are passed, get them from tarotCards data
  const cardsToShow = deckCards.length > 0 
    ? deckCards 
    : tarotCards.filter(card => {
        const deckName = selectedDeck?.name || '';
        return card.deck === deckName;
      });

  return (
    <Dialog open={!!open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <div className="flex items-center">
              <GlitchText text={selectedDeck?.displayName || ''} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">{selectedDeck?.description || t('cards.noDescription')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <DialogClose className="h-6 w-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
              <X className="h-4 w-4" />
              <span className="sr-only">{t('common.close')}</span>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        
        {cardsToShow.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {t('cards.noCardsInDeck')}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
            {cardsToShow.map((card) => (
              <div 
                key={card.id} 
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onCardClick(card.id)}
              >
                <div className="border-2 border-amber-300 rounded-lg overflow-hidden shadow-md w-full aspect-[2/3]">
                  <img 
                    src={card.image} 
                    alt={card.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      console.warn(`Failed to load card image: ${card.image}, using fallback`);
                      e.currentTarget.src = selectedDeck ? selectedDeck.backImage : "/img/cards/deck_1/0_TheDegen.png";
                    }}
                  />
                </div>
                <h5 className="mt-2 text-center text-xs font-medium">{card.name}</h5>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeckDetailsDialog;
