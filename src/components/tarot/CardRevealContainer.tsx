
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReadingCard } from '@/types/tarot';
import GlitchText from '@/components/GlitchText';
import CardItem from './CardItem';

interface CardRevealContainerProps {
  selectedCards: ReadingCard[];
  handleCardClick: (index: number) => void;
  loading: boolean;
  webhookMessage: string | null;
  cardBackImage: string;
}

const CardRevealContainer: React.FC<CardRevealContainerProps> = ({
  selectedCards,
  handleCardClick,
  loading,
  webhookMessage,
  cardBackImage
}) => {
  const { t } = useTranslation();
  
  // Track which cards have been flipped to prevent multiple flips
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [showingReadingMessage, setShowingReadingMessage] = useState(false);
  
  // Handle card click with animation - only allow one flip per card
  const handleCardReveal = async (index: number) => {
    // Check if card is already revealed or is currently being flipped
    if (selectedCards[index]?.revealed || loading || flippedCards[index]) return;
    
    // Mark this card as flipped to prevent multiple flips
    setFlippedCards(prev => ({ ...prev, [index]: true }));
    
    console.log(`Revealing card ${index}`, selectedCards[index]?.id);
    
    // Reveal the card
    setTimeout(() => {
      handleCardClick(index);
    }, 300);
  };

  // Check if all cards are revealed to show the final message
  useEffect(() => {
    if (selectedCards.every(card => card.revealed) && webhookMessage) {
      const timer = setTimeout(() => {
        setShowingReadingMessage(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedCards, webhookMessage]);
  
  return (
    <>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800">
          <GlitchText 
            text={t('tarot.revealCards')} 
            intensity="normal"
            neonEffect="purple"
          />
        </h3>
        <p className="text-gray-600 text-sm">
          {!showingReadingMessage 
            ? (webhookMessage && selectedCards.every(card => card.revealed)
              ? t('tarot.allCardsRevealed')
              : t('tarot.tapToReveal')) 
            : ''}
        </p>
      </div>
      
      {showingReadingMessage && webhookMessage && (
        <div className="my-6 p-5 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <GlitchText 
            text={webhookMessage}
            intensity="light"
            className="text-lg font-medium text-amber-800"
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {selectedCards.map((card, index) => (
          <CardItem
            key={card?.id || `card-${index}`}
            card={card}
            index={index}
            handleCardClick={handleCardReveal}
            isRevealed={card?.revealed}
            loading={loading}
            cardBackImage={cardBackImage}
          />
        ))}
      </div>
    </>
  );
};

export default CardRevealContainer;
