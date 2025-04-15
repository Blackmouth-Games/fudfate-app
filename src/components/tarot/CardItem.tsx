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
  
  // Placeholder constants
  const PLACEHOLDER_BACK = '/img/cards/deck_default/99_BACK.jpg';
  const PLACEHOLDER_FRONT = '/img/cards/deck_default/0_TheDegen.jpg';
  
  // Set up image sources with proper fallbacks
  useEffect(() => {
    // For card front (when revealed)
    if (card?.image) {
      // Log the image path for debugging
      console.log('Card image path:', card.image);
      
      // Ensure the image path starts with /img/
      const imagePath = card.image.startsWith('/') ? card.image : `/img/cards/${card.image}`;
      
      // Use the correct deck path
      const imageSrc = imagePath.includes(`${selectedDeck}/`) 
        ? imagePath 
        : imagePath.replace('/cards/', `/cards/${selectedDeck}/`);
      
      console.log('Processed image path:', imageSrc);
      setFrontImageSrc(imageSrc);
    } else {
      console.warn('No image provided for card:', card);
      setFrontImageSrc(PLACEHOLDER_FRONT);
    }
    
    // For card back
    if (cardBackImage) {
      // Ensure the back image path starts with /img/
      const backPath = cardBackImage.startsWith('/') 
        ? cardBackImage 
        : `/img/cards/${selectedDeck}/99_BACK.jpg`;
      console.log('Card back image path:', backPath);
      setBackImageSrc(backPath);
    } else {
      setBackImageSrc(PLACEHOLDER_BACK);
    }

    // Reset loading state when card changes
    setIsImageLoading(true);
  }, [card, cardBackImage, selectedDeck]);

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
        <div className="card-face card-back">
          <ImageLoader
            src={backImageSrc} 
            alt="Card Back" 
            className="w-full h-full object-cover rounded-lg"
            fallbackSrc={PLACEHOLDER_BACK}
            aspectRatio={5/8}
            skeletonClassName="bg-amber-100"
            onLoad={() => setIsImageLoading(false)}
            onError={() => setHasError(true)}
          />
        </div>
        
        <div className="card-face card-front">
          <ImageLoader
            src={frontImageSrc} 
            alt={card?.name || 'Tarot Card'}
            className="w-full h-full object-cover rounded-lg"
            fallbackSrc={PLACEHOLDER_FRONT}
            aspectRatio={5/8}
            skeletonClassName="bg-amber-100"
            onLoad={() => setIsImageLoading(false)}
            onError={() => setHasError(true)}
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
    </motion.div>
  );
};

export default CardItem;
