
import React from 'react';
import { motion } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

interface SelectionSlotProps {
  index: number;
  selected: boolean;
  isHighlighted: boolean;
  loading: boolean;
  cardBackImage: string;
  position: number;
}

const SelectionSlot: React.FC<SelectionSlotProps> = ({
  index,
  selected,
  isHighlighted,
  loading,
  cardBackImage,
  position
}) => {
  return (
    <motion.div
      key={`slot-${index}`}
      className={`w-20 h-28 sm:w-24 sm:h-36 rounded-md ${
        selected 
          ? 'bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-400/50 shadow-md' 
          : 'border border-dashed border-amber-300 bg-white selection-slot'
      } ${isHighlighted ? 'selection-slot-highlight' : ''} flex items-center justify-center relative overflow-hidden`}
      initial={selected ? { scale: 0.8 } : {}}
      animate={selected ? { scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {loading && !selected ? (
        <Skeleton className="w-full h-full rounded-md" />
      ) : selected ? (
        <motion.div 
          className="h-full w-full flex items-center justify-center"
          initial={{ rotateY: 90 }}
          animate={{ rotateY: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AspectRatio ratio={2/3} className="w-full h-full">
            <img
              src={cardBackImage}
              alt="Selected Card"
              className="h-full w-full object-cover rounded-md"
              onError={(e) => {
                // Fallback to default image if the dynamic path fails
                console.warn(`Failed to load image: ${cardBackImage}, using fallback`);
                e.currentTarget.src = `/img/cards/deck_1/99_BACK.png`;
              }}
            />
          </AspectRatio>
          <motion.div 
            className="absolute inset-0 bg-amber-400/20 rounded-md"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      ) : (
        <span className="text-xs text-amber-400">{index + 1}</span>
      )}
    </motion.div>
  );
};

export default SelectionSlot;
