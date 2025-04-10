
import React from 'react';
import { useTranslation } from 'react-i18next';
import SelectionSlot from './SelectionSlot';
import { ReadingCard } from '@/types/tarot';

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
    <div className="py-4 border-b border-amber-200">
      <div className="flex justify-center space-x-8">
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
    </div>
  );
};

export default SelectedCardsDisplay;
