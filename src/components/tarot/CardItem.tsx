
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
  return (
    <div className="flex flex-col items-center space-y-3">
      <motion.div 
        className="perspective-1000 w-full max-w-[200px]"
        whileHover={{ scale: isRevealed ? 1 : 1.05, transition: { duration: 0.2 } }}
      >
        <AspectRatio ratio={2/3}>
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
              className="absolute w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg shadow-md backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <img 
                src={cardBackImage} 
                alt="Card Back" 
                className="h-full w-full object-cover rounded-lg"
                onError={(e) => {
                  console.warn(`Failed to load card back image: ${cardBackImage}, using fallback`);
                  e.currentTarget.src = `/img/cards/deck_1/99_BACK.png`;
                }}
              />
            </div>
            
            {/* Card Front */}
            <div 
              className="absolute w-full h-full bg-gradient-to-br from-amber-100 to-white border-2 border-amber-300 rounded-lg shadow-lg backface-hidden"
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              {card && (
                <div className="p-3 h-full flex flex-col">
                  <div className="text-center font-bold text-amber-700 mb-2 bg-amber-50/50 py-1 rounded truncate">
                    {card.name}
                  </div>
                  <div className="flex-1 flex items-center justify-center p-2">
                    <img 
                      src={card.image} 
                      alt={card.name} 
                      className="max-h-full max-w-full object-contain drop-shadow-md"
                      onError={(e) => {
                        console.warn(`Failed to load card image: ${card.image}, using fallback`);
                        e.currentTarget.src = `/img/cards/deck_1/0_TheDegen.png`;
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
