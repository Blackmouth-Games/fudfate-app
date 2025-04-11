
import React from 'react';
import { CheckCircle2, LockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeckInfo } from '@/utils/deck-utils';
import { motion } from 'framer-motion';

interface DeckCardProps {
  deck: DeckInfo;
  isSelected: boolean;
  isSelecting: string | null;
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
  const isSelectingThis = isSelecting === deck.name;
  const [isHovered, setIsHovered] = React.useState(false);

  const getFallbackDeckImage = (): string => {
    return `/img/cards/deck_1/99_BACK.jpg`;
  };

  return (
    <div 
      className="flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div 
          className={`relative cursor-pointer border-2 rounded-lg overflow-hidden shadow-md transition-all w-full max-w-[120px] h-[192px] mx-auto
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
            src={(loadedImages[deck.id] ? deck.backImage : getFallbackDeckImage()).replace('.png', '.jpg')} 
            alt={deck.displayName} 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.warn(`Failed to load deck image: ${deck.backImage}, using fallback`);
              e.currentTarget.src = "/img/cards/deck_1/99_BACK.jpg";
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

        {/* Animated cards that appear on hover */}
        {isHovered && isUnlocked && (
          <>
            <motion.div 
              className="absolute top-0 left-0 max-w-[120px] z-10"
              initial={{ rotateZ: -5, x: -10, y: -5 }}
              animate={{ rotateZ: [-5, -8, -5], x: [-10, -12, -10], y: [-5, -8, -5] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            >
              <div className="aspect-[5/8] w-full overflow-hidden rounded-lg border-2 border-amber-300 shadow-md">
                <img 
                  src={deck.backImage.replace('.png', '.jpg')} 
                  alt="Card Back" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/img/cards/deck_1/99_BACK.jpg";
                  }}
                />
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute top-0 left-0 max-w-[120px] z-20"
              initial={{ rotateZ: 5, x: 10, y: -2 }}
              animate={{ rotateZ: [5, 8, 5], x: [10, 13, 10], y: [-2, -5, -2] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.1 }}
            >
              <div className="aspect-[5/8] w-full overflow-hidden rounded-lg border-2 border-amber-300 shadow-md">
                <img 
                  src={deck.backImage.replace('.png', '.jpg')} 
                  alt="Card Back" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/img/cards/deck_1/99_BACK.jpg";
                  }}
                />
              </div>
            </motion.div>
          </>
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
            disabled={isSelectingThis}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(deck.name);
            }}
          >
            {isSelectingThis ? 'Selecting...' : 'Select'}
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
