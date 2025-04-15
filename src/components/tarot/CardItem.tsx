
import React, { useEffect, useState } from 'react';
import { ReadingCard } from '@/types/tarot';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import ImageLoader from '@/components/ui/image-loader';
import { useTarot } from '@/contexts/TarotContext';

interface CardItemProps {
  card: ReadingCard;
  index: number;
  handleCardClick: (index: number) => void;
  isRevealed?: boolean;
  loading?: boolean;
  cardBackImage: string;
  onCardView?: () => void;
}

const CardItem: React.FC<CardItemProps> = ({ 
  card, 
  index, 
  handleCardClick, 
  isRevealed = false, 
  loading = false,
  cardBackImage,
  onCardView
}) => {
  const { selectedDeck } = useTarot();
  const [hasError, setHasError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [frontImageSrc, setFrontImageSrc] = useState('');
  const [backImageSrc, setBackImageSrc] = useState('');
  
  // Console log to debug card data
  useEffect(() => {
    console.log(`Card ${index} data:`, card);
  }, [card, index]);

  // Set up image sources with proper fallbacks
  useEffect(() => {
    // For card front (when revealed)
    if (card?.image) {
      let imagePath = '';
      
      // Make sure to handle different image path formats
      if (card.image.startsWith('/img/')) {
        imagePath = card.image;
      } else if (card.image.includes('/')) {
        imagePath = `/img/${card.image}`;
      } else {
        imagePath = `/img/cards/${selectedDeck}/${card.image}`;
      }
      
      // Convert png to jpg if needed
      if (!imagePath.endsWith('.jpg') && !imagePath.endsWith('.png')) {
        imagePath = `${imagePath}.jpg`;
      }
      
      console.log(`Card ${index} image path:`, imagePath);
      setFrontImageSrc(imagePath);
      setHasError(false);
    } else {
      console.warn(`Card ${index} has no image:`, card);
      setFrontImageSrc(`/img/cards/${selectedDeck.replace('deck', 'deck_')}/0_TheDegen.jpg`);
    }
    
    // For card back
    if (cardBackImage) {
      setBackImageSrc(cardBackImage);
    } else {
      // Ensure we're using the correct format (deck_X instead of deckX)
      const formattedDeck = selectedDeck.includes('_') ? 
        selectedDeck : 
        `deck_${selectedDeck.replace('deck', '')}`;
      setBackImageSrc(`/img/cards/${formattedDeck}/99_BACK.jpg`);
    }

    // Reset loading state when card changes
    setIsImageLoading(true);
  }, [card, cardBackImage, selectedDeck, index]);

  const handleClick = () => {
    if (isRevealed && onCardView) {
      onCardView();
    } else if (!loading) {
      handleCardClick(index);
    }
  };

  return (
    <motion.div
      className="card-container cursor-pointer"
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <div className={`tarot-card ${loading ? 'opacity-70 pointer-events-none' : ''} ${isRevealed ? 'is-flipped' : ''}`}>
        <div className="tarot-card-inner">
          <div className="tarot-card-back">
            <img 
              src={backImageSrc} 
              alt="Card Back" 
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                console.error(`Failed to load back image: ${backImageSrc}`);
                e.currentTarget.src = "/img/cards/deck_1/99_BACK.jpg";
              }}
            />
          </div>
          
          <div className="tarot-card-front">
            {isRevealed && (
              <>
                <div className="tarot-card-name">{card?.name || 'Unknown Card'}</div>
                <div className="tarot-card-image">
                  <img 
                    src={frontImageSrc} 
                    alt={card?.name || 'Tarot Card'}
                    onError={(e) => {
                      console.error(`Failed to load front image: ${frontImageSrc}`);
                      e.currentTarget.src = "/img/cards/deck_1/0_TheDegen.jpg";
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CardItem;
