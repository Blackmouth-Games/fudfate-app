import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Info } from 'lucide-react';
import GlitchText from '@/components/GlitchText';
import GoldGlitchText from '@/components/GoldGlitchText';
import { DeckInfo } from '@/utils/deck-utils';
import tarotCards from '@/data/tarotCards';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  const [descOpen, setDescOpen] = useState(false);
  const [descIdx, setDescIdx] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [card3DStyle, setCard3DStyle] = useState<{ transform?: string; boxShadow?: string }>({
    transform: 'rotateY(0deg) rotateX(0deg)',
    boxShadow: '0 8px 40px 0 rgba(0,0,0,0.18), 0 0 0 4px #FFD700'
  });
  const cardAreaRef = React.useRef<HTMLDivElement>(null);

  const handle3DMove = (x: number, y: number, rect: DOMRect) => {
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 25;
    const rotateX = -((y - centerY) / centerY) * 25;
    const shadowX = ((x - centerX) / centerX) * 20;
    const shadowY = ((y - centerY) / centerY) * 20;
    setCard3DStyle({
      transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
      boxShadow: `${-shadowX}px ${shadowY}px 40px 0 rgba(0,0,0,0.25), 0 0 0 4px #FFD700`
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handle3DMove(e.clientX - rect.left, e.clientY - rect.top, rect);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    handle3DMove(touch.clientX - rect.left, touch.clientY - rect.top, rect);
  };

  const reset3D = () => setCard3DStyle({
    transform: 'rotateY(0deg) rotateX(0deg)',
    boxShadow: '0 8px 40px 0 rgba(0,0,0,0.18), 0 0 0 4px #FFD700'
  });

  return (
    <Dialog open={!!open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center justify-center w-full">
              <GoldGlitchText text={selectedDeck?.displayName || ''} fontSize="2.2rem" className="text-center mt-2" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-5 w-5 ml-2 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs max-w-[260px] block">
                      <div>{selectedDeck?.description || t('cards.noDescription')}</div>
                      <div className="mt-2 text-yellow-700 font-semibold">{t('cards.deckViewerMemeDescription')}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </DialogHeader>
        
        {cardsToShow.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {t('cards.noCardsInDeck')}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
            {cardsToShow.map((card, idx) => (
              <div 
                key={card.id} 
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                onClick={() => { setDescIdx(idx); setSelectedCard(card); setDescOpen(true); }}
              >
                <div className="border-2 border-amber-300 rounded-lg overflow-hidden shadow-md w-full aspect-[5/8]">
                  <img 
                    src={card.image.replace('.png', '.jpg')} 
                    alt={card.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      console.warn(`Failed to load card image: ${card.image}, using fallback`);
                      e.currentTarget.src = selectedDeck ? selectedDeck.backImage.replace('.png', '.jpg') : "/img/cards/deck_1/0_TheDegen.jpg";
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
      {/* Modal para la descripción de la carta */}
      {descOpen && descIdx !== null && selectedCard && (
        <Dialog open={descOpen} onOpenChange={setDescOpen}>
          <DialogContent className="max-w-lg">
            <div className="flex flex-col items-center">
              <div
                className="relative flex items-center justify-center p-4 cursor-grab select-none"
                style={{ width: 320, height: 448 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={reset3D}
                onTouchMove={handleTouchMove}
                onTouchEnd={reset3D}
              >
                <div
                  className="border-2 border-amber-300 rounded-lg shadow-md transition-transform duration-300 bg-white overflow-hidden aspect-[5/8] w-full max-w-[280px]"
                  style={{
                    ...card3DStyle,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s cubic-bezier(.23,1.01,.32,1), box-shadow 0.3s cubic-bezier(.23,1.01,.32,1)'
                  }}
                >
                  <img
                    src={selectedCard.image.replace('.png', '.jpg')}
                    alt={selectedCard.name}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
              </div>
              <DialogTitle className="mt-6 mb-2">
                <GoldGlitchText text={t(`cards.deckCardDescriptions.${descIdx?.toString()}.title`)} fontSize="1.2rem" />
              </DialogTitle>
              <div className="py-2 text-gray-700 text-base whitespace-pre-line text-center max-w-md">
                {t(`cards.deckCardDescriptions.${descIdx?.toString()}.desc`)}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default DeckDetailsDialog;
