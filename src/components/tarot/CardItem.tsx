
import React, { useEffect, useState } from 'react';
import { ReadingCard } from '@/types/tarot';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { motion } from 'framer-motion';

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
  const [frontImageSrc, setFrontImageSrc] = useState('');
  const [backImageSrc, setBackImageSrc] = useState('/img/cards/deck_default/99_BACK.jpg'); // Default fallback
  
  // Set up image sources with proper fallbacks
  useEffect(() => {
    // For card front (when revealed)
    if (card?.image) {
      // Ensure we use jpg extension
      const imageSrc = card.image.replace('.png', '.jpg');
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
  }, [card, cardBackImage]);

  const handleClick = () => {
    console.log("Card clicked:", { isRevealed, cardId: card?.id, index });
    if (isRevealed && onCardView) {
      onCardView();
    } else {
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
          <div className="card-face card-back relative">
            <AspectRatio ratio={5/8}>
              <img 
                src={backImageSrc} 
                alt="Card Back" 
                className="w-full h-full object-cover rounded-lg"
                onError={() => {
                  console.warn(`Failed to load card back image: ${backImageSrc}, using fallback`);
                  setBackImageSrc('/img/cards/deck_default/99_BACK.jpg');
                }}
              />
            </AspectRatio>
          </div>
          
          {/* Card Front */}
          <div className="card-face card-front relative">
            <AspectRatio ratio={5/8}>
              <img 
                src={frontImageSrc} 
                alt={card?.name || 'Tarot Card'}
                className="w-full h-full object-cover rounded-lg" 
                onError={() => {
                  console.warn(`Failed to load card image: ${frontImageSrc}, using fallback`);
                  setHasError(true);
                  setFrontImageSrc('/img/cards/deck_1/0_TheDegen.jpg');
                }}
              />
            </AspectRatio>
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
