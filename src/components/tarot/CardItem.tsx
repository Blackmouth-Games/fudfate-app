
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
      } else if (imagePath.endsWith('.png')) {
        imagePath = imagePath.replace('.png', '.jpg');
      }
      
      console.log(`Card ${index} image path:`, imagePath);
      setFrontImageSrc(imagePath);
      setHasError(false);
    } else {
      console.warn(`Card ${index} has no image:`, card);
      setFrontImageSrc(`/img/cards/deck_default/0_TheDegen.jpg`);
    }
    
    // For card back
    if (cardBackImage) {
      // Ensure the back image path starts with /img/
      const backPath = cardBackImage.startsWith('/') 
        ? cardBackImage 
        : `/img/cards/${selectedDeck}/99_BACK.jpg`;
      
      setBackImageSrc(backPath);
    } else {
      setBackImageSrc(`/img/cards/${selectedDeck}/99_BACK.jpg`);
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
        <div className="card-face card-back">
          <ImageLoader
            src={backImageSrc} 
            alt="Card Back" 
            className="w-full h-full object-cover rounded-lg"
            fallbackSrc="/img/cards/deck_default/99_BACK.jpg"
            aspectRatio={5/8}
            skeletonClassName="bg-amber-100"
            onLoad={() => setIsImageLoading(false)}
            onError={() => {
              console.error(`Failed to load back image: ${backImageSrc}`);
              setHasError(true);
            }}
          />
        </div>
        
        <div className="card-face card-front">
          <ImageLoader
            src={frontImageSrc} 
            alt={card?.name || 'Tarot Card'}
            className="w-full h-full object-cover rounded-lg"
            fallbackSrc="/img/cards/deck_default/0_TheDegen.jpg"
            aspectRatio={5/8}
            skeletonClassName="bg-amber-100"
            onLoad={() => setIsImageLoading(false)}
            onError={() => {
              console.error(`Failed to load front image: ${frontImageSrc}`);
              setHasError(true);
            }}
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
