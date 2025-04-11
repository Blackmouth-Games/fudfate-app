
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReadingCard } from '@/types/tarot';
import GlitchText from '@/components/GlitchText';
import CardItem from './CardItem';
import ShareReading from './ShareReading';

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
  const [revealQueue, setRevealQueue] = useState<number[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [allRevealed, setAllRevealed] = useState(false);
  
  // Handle card click with animation - only allow one flip per card and queue if needed
  const handleCardReveal = async (index: number) => {
    // Check if card is already revealed or is currently being flipped
    if (selectedCards[index]?.revealed || loading || flippedCards[index]) return;
    
    // Mark this card as flipped to prevent multiple flips
    setFlippedCards(prev => ({ ...prev, [index]: true }));
    
    // Add to queue instead of immediately revealing
    setRevealQueue(prev => [...prev, index]);
  };

  // Process the reveal queue
  useEffect(() => {
    const processQueue = async () => {
      if (revealQueue.length === 0 || isProcessingQueue) return;
      
      setIsProcessingQueue(true);
      
      // Process first index in queue
      const index = revealQueue[0];
      console.log(`Processing card reveal for index ${index}`);
      
      // Reveal the card with delay
      await new Promise(resolve => setTimeout(resolve, 300));
      handleCardClick(index);
      
      // Remove from queue and wait before processing next
      setRevealQueue(prev => prev.slice(1));
      
      // Wait a bit longer before processing next card
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsProcessingQueue(false);
    };
    
    processQueue();
  }, [revealQueue, isProcessingQueue, handleCardClick]);

  // Check if all cards are revealed
  useEffect(() => {
    if (selectedCards.every(card => card.revealed)) {
      setAllRevealed(true);
    }
  }, [selectedCards]);
  
  return (
    <div className="space-y-8">
      <p className="text-gray-600 text-sm text-center">
        {!allRevealed 
          ? t('tarot.tapToReveal')
          : t('tarot.allCardsRevealed')}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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
      
      {allRevealed && webhookMessage && (
        <div className="mt-10 space-y-6">
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <p className="text-lg font-medium text-amber-800">{webhookMessage}</p>
          </div>
          
          <ShareReading className="mt-6" />
        </div>
      )}
    </div>
  );
};

export default CardRevealContainer;
