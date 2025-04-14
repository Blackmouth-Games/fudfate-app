
import React, { useEffect, useState } from 'react';
import { ReadingCard } from '@/types/tarot';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import ImageLoader from '@/components/ui/image-loader';

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
  const [hasError, setHasError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [frontImageSrc, setFrontImageSrc] = useState('');
  const [backImageSrc, setBackImageSrc] = useState('/img/cards/deck_default/99_BACK.jpg'); // Default fallback
  
  // Set up image sources with proper fallbacks
  useEffect(() => {
    // For card front (when revealed)
    if (card?.image) {
      // Always ensure we use jpg extension
      const imageSrc = card.image.endsWith('.png') 
        ? card.image.replace('.png', '.jpg') 
        : card.image;
      setFrontImageSrc(imageSrc);
    } else {
      setFrontImageSrc('/img/cards/deck_1/0_TheDegen.jpg');
    }
    
    // For card back
    if (cardBackImage) {
      setBackImageSrc(cardBackImage);
    } else {
      setBackImageSrc('/img/cards/deck_default/99_BACK.jpg');
    }

    // Reset loading state when card changes
    setIsImageLoading(true);
  }, [card, cardBackImage]);

  const handleClick = () => {
    console.log("Card clicked:", { isRevealed, cardId: card?.id, index });
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
      <div className={`card-wrapper relative ${loading ? 'opacity-70 pointer-events-none' : ''}`}>
        <div className={`card ${isRevealed ? 'is-flipped' : ''}`}>
          {/* Card Back */}
          <div className="card-face card-back">
            <ImageLoader
              src={backImageSrc} 
              alt="Card Back" 
              className="w-full h-full rounded-lg"
              fallbackSrc="/img/cards/deck_default/99_BACK.jpg"
              aspectRatio={5/8}
              skeletonClassName="bg-amber-100"
            />
          </div>
          
          {/* Card Front */}
          <div className="card-face card-front">
            <ImageLoader
              src={frontImageSrc} 
              alt={card?.name || 'Tarot Card'}
              className="w-full h-full rounded-lg"
              fallbackSrc="/img/cards/deck_1/0_TheDegen.jpg"
              aspectRatio={5/8}
              skeletonClassName="bg-amber-100"
            />
            {isRevealed && (
              <motion.div 
                className="absolute inset-0 bg-amber-400/20 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CardItem;
