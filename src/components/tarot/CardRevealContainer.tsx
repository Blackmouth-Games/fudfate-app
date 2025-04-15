
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReadingCard } from '@/types/tarot';
import CardItem from './CardItem';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import CardDetailsDialog from './CardDetailsDialog';

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
  
  // Track which cards have been revealed
  const [allRevealed, setAllRevealed] = useState(false);
  // Track selected card for details dialog
  const [selectedCardDetails, setSelectedCardDetails] = useState<ReadingCard | null>(null);
  // Control visibility of the card details dialog
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Check if all cards are revealed
  useEffect(() => {
    if (selectedCards.length > 0 && selectedCards.every(card => card.revealed)) {
      setAllRevealed(true);
    } else {
      setAllRevealed(false);
    }
  }, [selectedCards]);
  
  // Handle card click directly without queueing
  const handleCardReveal = (index: number) => {
    if (loading) {
      console.log("Card click ignored - loading state:", loading);
      return;
    }
    
    console.log("Handling card reveal for index:", index);
    handleCardClick(index);
  };

  // View card details
  const viewCardDetails = (card: ReadingCard) => {
    setSelectedCardDetails(card);
    setIsDetailsOpen(true);
  };
  
  // Share to Twitter/X
  const shareToX = () => {
    // Only share final message without duplicating it
    const text = `I just got a crypto tarot reading! ${webhookMessage || 'Check out my fortune!'}`;
    const url = window.location.href;
    const hashtags = 'CryptoTarot,FUDFate';
    const token = '$FDft @fudfate';
    
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}&via=${encodeURIComponent(token)}`,
      '_blank'
    );
  };
  
  return (
    <div className="space-y-8">
      <p className="text-gray-600 text-sm text-center">
        {t('tarot.tapToReveal')}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {selectedCards.map((card, index) => (
          <CardItem
            key={`card-${index}-${card?.id || 'unknown'}`}
            card={card}
            index={index}
            handleCardClick={handleCardReveal}
            isRevealed={card?.revealed}
            loading={loading}
            cardBackImage={cardBackImage}
            onCardView={card.revealed ? () => viewCardDetails(card) : undefined}
          />
        ))}
      </div>
      
      {allRevealed && webhookMessage && (
        <div className="mt-10 space-y-6">
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <p className="text-lg font-medium text-amber-800">{webhookMessage}</p>
          </div>
          
          <div className="mt-6 flex flex-col items-center space-y-4">
            <Button 
              onClick={shareToX}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white"
            >
              <X className="h-4 w-4" />
              {t('tarot.shareOnX')}
            </Button>
          </div>
        </div>
      )}

      <CardDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        cardDetails={selectedCardDetails}
      />
    </div>
  );
};

export default CardRevealContainer;
