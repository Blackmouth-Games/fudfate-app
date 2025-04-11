
import React from 'react';
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
  const handleClick = () => {
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
          <div className="card-face card-back">
            <AspectRatio ratio={5/8}>
              <img 
                src={cardBackImage} 
                alt="Card Back" 
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  console.warn(`Failed to load card back image: ${cardBackImage}`);
                  e.currentTarget.src = `/img/cards/deck_1/99_BACK.jpg`;
                }}
              />
            </AspectRatio>
          </div>
          
          <div className="card-face card-front">
            <AspectRatio ratio={5/8}>
              <img 
                src={card?.image.replace('.png', '.jpg')} 
                alt={card?.name}
                className="w-full h-full object-cover rounded-lg" 
                onError={(e) => {
                  console.warn(`Failed to load card image: ${card?.image}`);
                  e.currentTarget.src = `/img/cards/deck_1/0_TheDegen.jpg`;
                }}
              />
            </AspectRatio>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CardItem;
