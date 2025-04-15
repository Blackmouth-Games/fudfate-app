
import React, { useEffect, useState } from 'react';
import { ReadingCard } from '@/types/tarot';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import ImageLoader from '@/components/ui/image-loader';
import { useTarot } from '@/contexts/TarotContext';
import { getCardPath, getCardBackPath } from '@/utils/deck-utils';

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
  
  // Console log to debug card data with more detailed information
  useEffect(() => {
    console.log(`Card ${index} data:`, {
      ...card,
      selectedDeck,
      id: card.id,
      name: card.name,
      deck: card.deck || selectedDeck,
      revealed: card.revealed
    });
  }, [card, index, selectedDeck]);

  // Set up image sources with proper fallbacks
  useEffect(() => {
    // For card front (when revealed)
    if (card?.image) {
      // Try to use the image from the card object
      let imagePath = card.image;
      
      // Make sure to handle different image path formats
      if (!imagePath.startsWith('/')) {
        // Use card's deck if available, otherwise use the selected deck
        const cardDeck = card.deck || selectedDeck;
        imagePath = `/img/cards/${cardDeck}/${imagePath}`;
      }
      
      // Convert png to jpg if needed
      if (!imagePath.endsWith('.jpg') && !imagePath.endsWith('.png')) {
        imagePath = `${imagePath}.jpg`;
      }
      
      console.log(`Card ${index} front image path:`, imagePath);
      setFrontImageSrc(imagePath);
    } else if (card?.id) {
      // Use the card ID to construct a path
      const deckToUse = card.deck || selectedDeck;
      const imagePath = getCardPath(deckToUse, card.id);
      console.log(`Card ${index} generated front image path:`, imagePath);
      setFrontImageSrc(imagePath);
    } else {
      console.warn(`Card ${index} has no image or ID:`, card);
      setFrontImageSrc(`/img/cards/deck_1/0_TheDegen.jpg`);
    }
    
    // For card back, use the provided cardBackImage directly
    if (cardBackImage) {
      console.log(`Card ${index} back image path:`, cardBackImage);
      setBackImageSrc(cardBackImage);
    } else {
      // Fallback to using the selectedDeck
      const backPath = getCardBackPath(card.deck || selectedDeck);
      console.log(`Card ${index} fallback back image path:`, backPath);
      setBackImageSrc(backPath);
    }

    // Reset loading state when card changes
    setIsImageLoading(true);
  }, [card, cardBackImage, selectedDeck, index]);

  const handleClick = () => {
    if (isRevealed && onCardView) {
      onCardView();
    } else if (!loading) {
      console.log(`Clicking card at index ${index}`);
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
                    onLoad={() => setIsImageLoading(false)}
                    onError={(e) => {
                      console.error(`Failed to load front image: ${frontImageSrc}`);
                      setHasError(true);
                      // Use card's deck if available, otherwise use the selected deck
                      const cardDeck = card.deck || selectedDeck;
                      const fallbackImage = cardDeck === 'deck_2' ? 
                        "/img/cards/deck_2/0_the fool.jpg" : 
                        "/img/cards/deck_1/0_TheDegen.jpg";
                      e.currentTarget.src = fallbackImage;
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
