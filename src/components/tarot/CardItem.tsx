
import React from 'react';
import { motion } from 'framer-motion';
import { ReadingCard } from '@/types/tarot';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CardItemProps {
  card: ReadingCard;
  index: number;
  handleCardClick: (index: number) => void;
  isRevealed: boolean;
  loading: boolean;
  cardBackImage: string;
}

const CardItem: React.FC<CardItemProps> = ({
  card,
  index,
  handleCardClick,
  isRevealed,
  loading,
  cardBackImage
}) => {
  // Ensure all image paths use .jpg instead of .png
  const cardImage = card?.image ? card.image.replace('.png', '.jpg') : '';
  const backImage = cardBackImage.replace('.png', '.jpg');

  return (
    <div className="flex flex-col items-center space-y-3">
      <motion.div 
        className="perspective-1000 w-full"
        whileHover={{ scale: isRevealed ? 1.02 : 1.05, transition: { duration: 0.2 } }}
      >
        <AspectRatio ratio={5/8} className="w-full">
          <motion.div 
            className={`relative w-full h-full transition-transform duration-1000 transform-style-3d cursor-pointer`}
            style={{ 
              transformStyle: "preserve-3d",
              transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
            onClick={() => !isRevealed && !loading && handleCardClick(index)}
          >
            {/* Card Back */}
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-lg backface-hidden card-fullview shadow-lg"
              style={{ backfaceVisibility: "hidden" }}
            >
              <img 
                src={backImage} 
                alt="Card Back" 
                className="h-full w-full object-cover rounded-lg"
                onError={(e) => {
                  console.warn(`Failed to load card back image: ${backImage}, using fallback`);
                  e.currentTarget.src = `/img/cards/deck_1/99_BACK.jpg`;
                }}
              />
            </div>
            
            {/* Card Front */}
            <div 
              className="absolute w-full h-full bg-white border-2 border-amber-400 rounded-lg backface-hidden card-fullview shadow-xl"
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              {card && (
                <div className="p-3 h-full flex flex-col">
                  <div className="text-center font-bold text-amber-800 mb-2 bg-amber-50 py-1.5 px-2 rounded-md truncate">
                    {card.name}
                  </div>
                  <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
                    <motion.img 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      src={cardImage} 
                      alt={card.name} 
                      className="max-h-full max-w-full object-contain rounded-md"
                      onError={(e) => {
                        console.warn(`Failed to load card image: ${cardImage}, using fallback`);
                        e.currentTarget.src = `/img/cards/deck_1/0_TheDegen.jpg`;
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AspectRatio>
      </motion.div>
    </div>
  );
};

export default CardItem;
