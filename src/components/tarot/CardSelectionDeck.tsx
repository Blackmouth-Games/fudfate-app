
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/types/tarot';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import '../../styles/tarot.css';

interface CardSelectionDeckProps {
  allDeckCards: Card[];
  loading: boolean;
  selectedCardId: string | null;
  animatingToSlot: number | null;
  selectedCards: any[];
  cardBackImage: string;
  handleCardSelect: (cardId: string) => void;
}

const CardSelectionDeck: React.FC<CardSelectionDeckProps> = ({
  allDeckCards,
  loading,
  selectedCardId,
  animatingToSlot,
  selectedCards,
  cardBackImage,
  handleCardSelect
}) => {
  const { t } = useTranslation();
  
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {[...Array(10)].map((_, index) => (
          <Skeleton 
            key={`skeleton-${index}`} 
            className="w-full aspect-[5/8] rounded-lg"
          />
        ))}
      </div>
    );
  }
  
  // Filter out cards that are already selected
  const availableCards = allDeckCards.filter(card => 
    !selectedCards.some(selectedCard => selectedCard.id === card.id)
  );
  
  // If no cards available, show empty state
  if (availableCards.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">{t('tarot.noCardsAvailable')}</p>
      </div>
    );
  }
  
  return (
    <div className="deck-fan grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {availableCards.map((card, index) => {
        // Check if this card is being animated
        const isAnimating = card.id === selectedCardId;
        
        return (
          <motion.div
            key={`card-${card.id}`}
            className={`tarot-selection-card cursor-pointer transition-all duration-300 hover:shadow-lg ${isAnimating ? 'card-selecting' : ''}`}
            onClick={() => !isAnimating && handleCardSelect(card.id)}
            whileHover={{ 
              scale: 1.05,
              zIndex: 50,
              transition: { duration: 0.2 }
            }}
            initial={false}
            animate={isAnimating ? {
              opacity: 0,
              scale: 0.8,
              y: -100,
              transition: { duration: 0.5 }
            } : {}}
          >
            <img 
              src={cardBackImage} 
              alt={t('tarot.cardBack')}
              className="w-full h-full object-cover rounded-md"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/img/cards/deck_1/99_BACK.jpg";
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default CardSelectionDeck;
