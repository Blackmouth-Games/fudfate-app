
import React from 'react';
import { CheckCircle2, LockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeckInfo } from '@/utils/deck-utils';

interface DeckCardProps {
  deck: DeckInfo;
  isSelected: boolean;
  isSelecting: boolean;
  onSelect: (deckName: string) => void;
  onDetailsOpen: (deckId: string) => void;
  loadedImages: Record<string, boolean>;
  t: (key: string) => string;
}

const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  isSelected,
  isSelecting,
  onSelect,
  onDetailsOpen,
  loadedImages,
  t
}) => {
  const isUnlocked = deck.isActive;

  const getFallbackDeckImage = (): string => {
    return `/img/cards/deck_1/99_BACK.png`;
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative cursor-pointer border-2 rounded-lg overflow-hidden shadow-md transition-all w-full max-w-[120px] h-[170px] mx-auto
          ${isSelected ? 'border-amber-500 shadow-amber-200' : 'border-gray-200'}
          ${!isUnlocked ? 'opacity-50 grayscale' : 'hover:shadow-lg hover:border-amber-300'}`}
        onClick={() => {
          if (isUnlocked) {
            onSelect(deck.id);
            onDetailsOpen(deck.id);
          }
        }}
      >
        <img 
          src={loadedImages[deck.id] ? deck.backImage : getFallbackDeckImage()} 
          alt={deck.displayName} 
          className="w-full h-full object-cover"
          onError={(e) => {
            console.warn(`Failed to load deck image: ${deck.backImage}, using fallback`);
            e.currentTarget.src = "/img/cards/deck_1/99_BACK.png";
          }}
        />
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-black bg-opacity-50 px-2 py-1 rounded flex items-center gap-1">
              <LockIcon className="h-3 w-3 text-white" />
              <span className="text-white font-medium text-sm">
                {t('tarot.locked')}
              </span>
            </div>
          </div>
        )}
        {isSelected && (
          <div className="absolute top-1 right-1 bg-amber-500 w-3 h-3 rounded-full border border-white"></div>
        )}
      </div>
      <h4 className="mt-2 text-center text-sm font-medium">
        {deck.displayName}
      </h4>
      <div className="flex flex-col items-center">
        {isSelected ? (
          <span className="text-xs text-amber-600 font-medium mb-1 flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1" /> {t('tarot.selected')}
          </span>
        ) : isUnlocked ? (
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs h-6 px-2 mt-1"
            disabled={isSelecting === deck.name}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(deck.name);
            }}
          >
            {isSelecting === deck.name ? 'Selecting...' : 'Select'}
          </Button>
        ) : (
          <span className="text-xs text-gray-400 italic">
            {t('tarot.comingSoon')}
          </span>
        )}
      </div>
    </div>
  );
};

export default DeckCard;
