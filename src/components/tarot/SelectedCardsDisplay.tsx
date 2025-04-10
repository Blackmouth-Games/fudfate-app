
import React from 'react';
import { useTranslation } from 'react-i18next';
import SelectionSlot from './SelectionSlot';
import { ReadingCard } from '@/types/tarot';
import { motion } from 'framer-motion';

interface SelectedCardsDisplayProps {
  selectedCards: ReadingCard[];
  highlightedSlot: number | null;
  loading: boolean;
  cardBackImage: string;
}

const SelectedCardsDisplay: React.FC<SelectedCardsDisplayProps> = ({
  selectedCards,
  highlightedSlot,
  loading,
  cardBackImage
}) => {
  const { t } = useTranslation();
  
  return (
    <motion.div 
      className="py-6 border-b border-amber-200 bg-gradient-to-r from-amber-50/50 to-amber-100/30 rounded-lg px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4 className="text-center font-medium mb-6 text-amber-800">
        {t('tarot.selectedCards', { count: selectedCards.length })}
      </h4>
      
      <div className="flex justify-center gap-6 sm:gap-10">
        {Array.from({ length: 3 }).map((_, i) => {
          const selected = selectedCards[i];
          const isHighlighted = highlightedSlot === i;
          
          return (
            <SelectionSlot
              key={`slot-${i}`}
              index={i}
              selected={!!selected}
              isHighlighted={isHighlighted}
              loading={loading}
              cardBackImage={cardBackImage}
              position={i}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default SelectedCardsDisplay;
