import React, { useEffect, useRef } from 'react';
import { CheckCircle2, LockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeckInfo } from '@/utils/deck-utils';
import { motion } from 'framer-motion';
import tarotCards from '@/data/tarotCards';
import RocketCelebration from '@/components/animations/RocketCelebration';

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
  const [showCelebration, setShowCelebration] = React.useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout>();

  // Debug log
  console.log('DeckCard render:', { 
    deckName: deck.name, 
    isSelected, 
    showCelebration 
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // Start celebration
    setShowCelebration(true);

    // Call onSelect after animation duration
    animationTimeoutRef.current = setTimeout(() => {
      onSelect(deck.name);
    }, 1000); // Reduced from 2500 to 1000 to match faster animation
  };

  const handleCelebrationComplete = () => {
    console.log('Celebration complete for deck:', deck.name);
    setShowCelebration(false);
  };

  const deckCards = React.useMemo(() => {
    return tarotCards.filter(card => card.deck === deck.name);
  }, [deck.name]);

  const getSampleCards = () => {
    if (deckCards.length === 0) return {
      card1: deck.backImage.replace('.png', '.jpg'),
      card2: deck.backImage.replace('.png', '.jpg')
    };
    
    const randomIndex1 = Math.floor(Math.random() * deckCards.length);
    let randomIndex2 = Math.floor(Math.random() * deckCards.length);
    if (deckCards.length > 1 && randomIndex2 === randomIndex1) {
      randomIndex2 = (randomIndex2 + 1) % deckCards.length;
    }
    
    return {
      card1: deckCards[randomIndex1].image.replace('.png', '.jpg'),
      card2: deckCards[randomIndex2 !== undefined ? randomIndex2 : randomIndex1].image.replace('.png', '.jpg')
    };
  };
  
  const sampleCards = React.useMemo(() => getSampleCards(), [deckCards]);

  const getFallbackDeckImage = (): string => {
    return `/img/cards/deck_1/99_BACK.jpg`;
  };

  return (
    <div className="flex flex-col items-center relative">
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <RocketCelebration 
          show={showCelebration} 
          onComplete={handleCelebrationComplete}
        />
      </div>
      
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && isUnlocked && (
          <>
            <motion.div 
              className="absolute top-0 left-0 max-w-[150px] z-0"
              initial={{ rotateZ: -20, x: -30, y: -10 }}
              animate={{ 
                rotateZ: [-20, -25, -20], 
                x: [-30, -35, -30], 
                y: [-10, -15, -10] 
              }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            >
              <div className="aspect-[5/8] w-full overflow-hidden rounded-lg border-2 border-amber-400 shadow-md">
                <img 
                  src={sampleCards.card1} 
                  alt="Card Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/img/cards/deck_1/99_BACK.jpg";
                  }}
                />
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute top-0 left-0 max-w-[150px] z-0"
              initial={{ rotateZ: 20, x: 30, y: -5 }}
              animate={{ 
                rotateZ: [20, 25, 20], 
                x: [30, 35, 30], 
                y: [-5, -10, -5] 
              }}
              transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.1 }}
            >
              <div className="aspect-[5/8] w-full overflow-hidden rounded-lg border-2 border-amber-400 shadow-md">
                <img 
                  src={sampleCards.card2} 
                  alt="Card Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/img/cards/deck_1/99_BACK.jpg";
                  }}
                />
              </div>
            </motion.div>
          </>
        )}

        <div 
          className={`relative cursor-pointer rounded-lg overflow-hidden shadow-md transition-all w-full max-w-[150px] h-[240px] mx-auto z-10
            ${isSelected ? 'border-[#3ADDD9] border-[3px] shadow-[#3ADDD9]/20' : 'border-amber-400 border-2'}
            ${!isUnlocked ? 'opacity-50 grayscale' : 'hover:shadow-lg hover:border-amber-500'}`}
          onClick={() => {
            if (isUnlocked) {
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
            <div className="absolute top-1 right-1 bg-[#3ADDD9] w-3 h-3 rounded-full border border-white"></div>
          )}
        </div>
      </div>

      <h4 className="mt-2 text-center text-sm font-medium">
        {deck.description || deck.displayName}
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
            className="text-xs h-6 px-2 mt-1 relative z-20"
            disabled={isSelectingThis || showCelebration}
            onClick={handleSelect}
          >
            {isSelectingThis ? t('tarot.selecting') : t('tarot.select')}
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
