
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
    <motion.div 
      className="flex flex-col items-center space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="perspective-1000 w-full">
        <AspectRatio ratio={2/3} className="w-full">
          <motion.div 
            className={`relative w-full h-full transition-transform duration-1000 transform-style-3d cursor-pointer`}
            style={{ 
              transformStyle: "preserve-3d",
              transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
            whileHover={!isRevealed && !loading ? { scale: 1.05, transition: { duration: 0.2 } } : {}}
            onClick={() => !isRevealed && !loading && handleCardClick(index)}
          >
            {/* Card Back */}
            <div 
              className="absolute w-full h-full border-2 border-amber-300 rounded-lg backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <img 
                src={cardBackImage} 
                alt="Card Back" 
                className="h-full w-full object-contain rounded-lg p-1"
                onError={(e) => {
                  console.warn(`Failed to load card back image: ${cardBackImage}, using fallback`);
                  e.currentTarget.src = `/img/cards/deck_1/99_BACK.png`;
                }}
              />
            </div>
            
            {/* Card Front */}
            <div 
              className="absolute w-full h-full bg-white border-2 border-amber-300 rounded-lg backface-hidden"
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              {card && (
                <div className="p-2 h-full flex flex-col">
                  <div className="text-center font-bold text-amber-700 mb-1 bg-amber-50/50 py-1 px-2 rounded truncate text-sm">
                    {card.name}
                  </div>
                  <div className="flex-1 flex items-center justify-center p-1 relative">
                    <img 
                      src={card.image} 
                      alt={card.name} 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        console.warn(`Failed to load card image: ${card.image}, using fallback`);
                        e.currentTarget.src = `/img/cards/deck_1/0_TheDegen.png`;
                      }}
                    />
                    
                    <motion.div 
                      className="absolute inset-0 bg-amber-400/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AspectRatio>
      </div>
      
      {isRevealed && (
        <motion.div 
          className="text-sm text-center text-amber-800 font-medium px-2 py-1 rounded-full bg-amber-100/50 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {index === 0 ? "Past" : index === 1 ? "Present" : "Future"}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CardItem;
