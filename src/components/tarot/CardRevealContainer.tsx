
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReadingCard } from '@/types/tarot';
import CardItem from './CardItem';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, RefreshCw } from 'lucide-react';
import CardDetailsDialog from './CardDetailsDialog';
import ShareReading from './ShareReading';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CardRevealContainerProps {
  selectedCards: ReadingCard[];
  handleCardClick: (index: number) => void;
  loading: boolean;
  webhookMessage: string | null;
  webhookQuestion?: string | null;
  cardBackImage: string;
  error?: string | null;
}

const CardRevealContainer: React.FC<CardRevealContainerProps> = ({
  selectedCards,
  handleCardClick,
  loading,
  webhookMessage,
  webhookQuestion,
  cardBackImage,
  error
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
  
  // Debug log when selected cards change
  useEffect(() => {
    console.log("CardRevealContainer - Selected Cards:", 
      selectedCards.map((card, index) => ({
        position: index,
        id: card.id,
        name: card.name,
        revealed: card.revealed,
        deck: card.deck
      }))
    );
    console.log("CardRevealContainer - Card Back Image:", cardBackImage);
  }, [selectedCards, cardBackImage]);
  
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
  
  // Show error message if data isn't ready yet
  const showErrorMessage = error || (!webhookMessage && !allRevealed);
  
  return (
    <div className="space-y-8">
      {showErrorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {error || "Reading data not ready yet. Please wait a moment and try again."}
          </AlertDescription>
        </Alert>
      )}
      
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
          {webhookQuestion && (
            <div className="p-5 bg-purple-50 border border-purple-200 rounded-lg text-center">
              <p className="text-lg font-medium text-purple-800">{webhookQuestion}</p>
            </div>
          )}
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <p className="text-lg font-medium text-amber-800">{webhookMessage}</p>
          </div>
          
          <div className="mt-6 flex flex-col items-center space-y-4">
            <ShareReading className="w-full" />
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
