import React from 'react';
import { ReadingCard } from '@/types/tarot';

interface TarotCardProps {
  card: ReadingCard;
  isSelected?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
}

const TarotCard: React.FC<TarotCardProps> = ({
  card,
  isSelected = false,
  isRevealed = false,
  onClick
}) => {
  return (
    <div
      className={`relative w-48 h-80 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-500 ${
        isRevealed ? 'scale-100' : 'scale-95'
      } ${isSelected ? 'ring-2 ring-[#3ADDD9]' : ''}`}
      onClick={onClick}
    >
      <img
        src={isRevealed ? card.image : '/cards/back.jpg'}
        alt={isRevealed ? card.name : 'Tarot Card Back'}
        className="w-full h-full object-cover rounded-lg transform transition-transform duration-1000"
      />
    </div>
  );
};

export default TarotCard;
