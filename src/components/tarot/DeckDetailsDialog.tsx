
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import TarotCard from '@/components/TarotCard';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DeckInfo } from '@/utils/deck-utils';
import GlitchText from '@/components/GlitchText';

interface DeckDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: string | null;
  decks: DeckInfo[];
  deckCards: any[];
  onCardClick?: (cardId: string) => void;
  t: any; // Translation function
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
  const [activeDeckId, setActiveDeckId] = useState<string | null>(deckId);
  
  // Find the active deck details
  const activeDeck = decks.find(deck => deck.id === activeDeckId);
  
  // Handle tab change
  const handleDeckChange = (newDeckId: string) => {
    setActiveDeckId(newDeckId);
  };
  
  // Reset active deck when dialog is closed
  React.useEffect(() => {
    if (!open) {
      // Wait for dialog close animation before resetting
      const timeout = setTimeout(() => {
        setActiveDeckId(deckId);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setActiveDeckId(deckId);
    }
  }, [open, deckId]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-center">
            <GlitchText 
              text={activeDeck?.name || t('tarot.deckViewer')} 
              className="text-2xl font-pixel-2p"
              goldEffect
            />
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>
        
        {/* Deck tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {decks.map(deck => (
            <Button
              key={deck.id}
              variant={deck.id === activeDeckId ? "default" : "outline"}
              size="sm"
              onClick={() => handleDeckChange(deck.id)}
              className={deck.id === activeDeckId ? "bg-amber-600 hover:bg-amber-700" : "border-amber-300 hover:bg-amber-50"}
            >
              {deck.name}
            </Button>
          ))}
        </div>
        
        {/* Card grid - Remove card click functionality */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2">
          {deckCards.map(card => (
            <div 
              key={card.id}
              className="aspect-[5/8] transition-transform transform hover:-translate-y-1"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-full">
                    <TarotCard 
                      imageUrl={card.image.replace('.png', '.jpg')} 
                      title={card.name} 
                      glitchEffect="none"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-bold">{card.name}</p>
                  <p className="text-xs mt-1">{card.description}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeckDetailsDialog;
