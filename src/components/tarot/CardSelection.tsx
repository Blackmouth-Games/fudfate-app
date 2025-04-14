
import React, { useState, useEffect } from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@/contexts/WalletContext';
import GlitchText from '@/components/GlitchText';
import { AlertTriangle } from 'lucide-react';
import { getCardBackPath } from '@/utils/deck-utils';
import tarotCards from '@/data/tarotCards';
import SelectedCardsDisplay from './SelectedCardsDisplay';
import CardSelectionDeck from './CardSelectionDeck';
import { Button } from '@/components/ui/button';

interface CardSelectionProps {
  className?: string;
}

const CardSelection: React.FC<CardSelectionProps> = ({ className = '' }) => {
  const { availableCards, selectedCards, selectCard, loading, selectedDeck, phase, setPhase } = useTarot();
  const { userData } = useWallet();
  const { t } = useTranslation();
  
  const [allDeckCards, setAllDeckCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [animatingToSlot, setAnimatingToSlot] = useState<number | null>(null);
  const [highlightedSlot, setHighlightedSlot] = useState<number | null>(null);
  
  // Use the correct path format for card back images
  const cardBackImage = getCardBackPath(selectedDeck);
  
  // Load all cards from the current deck on component mount or deck change
  useEffect(() => {
    // These are just mock cards for selection UI, the real reveal will use webhook data
    // Get all cards for the selected deck
    const deckCards = tarotCards.filter(card => card.deck === selectedDeck);
    setAllDeckCards(deckCards);
  }, [selectedDeck]);
  
  // Check if user can make readings (userData.runsToday should be true for "can read")
  // Empty state - no cards available or user can't read
  if ((allDeckCards.length === 0 && !loading) || (userData && !userData.runsToday)) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-6 max-w-md mx-auto">
          <div className="mb-4 flex justify-center">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            <GlitchText text={t('tarot.noMoreReadings')} />
          </h3>
          <p className="text-gray-600 text-sm">
            {t('tarot.comeBackTomorrow')}
          </p>
        </div>
      </div>
    );
  }

  const handleCardSelect = (cardId: string) => {
    console.log("Selecting card:", cardId);
    
    // Only allow selection if we haven't selected 3 cards yet
    if (selectedCards.length >= 3) return;
    
    // Set the card as selected for animation
    setSelectedCardId(cardId);
    setHighlightedSlot(selectedCards.length);
    
    // Start animation to slot
    setAnimatingToSlot(selectedCards.length);
    
    // After animation completes, actually select the card
    setTimeout(() => {
      selectCard(cardId);
      setSelectedCardId(null);
      setAnimatingToSlot(null);
      setHighlightedSlot(null);
    }, 500); // Match this to the animation duration
  };

  const handleProceedToReading = () => {
    if (selectedCards.length === 3) {
      setPhase('reading');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800">
          <GlitchText text={t('tarot.selectCards')} goldEffect />
        </h3>
        <p className="text-gray-600 text-sm">
          {t('tarot.selectCardsDescription', { selected: selectedCards.length, total: 3 })}
        </p>
      </div>
      
      {/* Display selected cards at the top with larger size */}
      <div className="mb-8">
        <SelectedCardsDisplay
          selectedCards={selectedCards}
          highlightedSlot={highlightedSlot}
          loading={loading}
          cardBackImage={cardBackImage}
        />
        
        {/* Display Selected Cards text BELOW the cards */}
        <div className="text-center mt-4">
          <h4 className="font-medium text-gray-700">
            {t('tarot.selectedCards', { count: selectedCards.length })}
          </h4>
        </div>
        
        {/* Continue button - only show when all 3 cards are selected */}
        {selectedCards.length === 3 && (
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={handleProceedToReading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {t('tarot.continueToReading')}
            </Button>
          </div>
        )}
        
        {/* Available Cards text now goes below selected cards */}
        <div className="text-center mt-8 mb-4">
          <h4 className="font-medium text-gray-700">
            {t('tarot.availableCards')}
          </h4>
        </div>
      </div>
      
      {/* All available cards for selection with improved layout */}
      <div className="relative mt-2">
        <CardSelectionDeck
          allDeckCards={allDeckCards}
          loading={loading}
          selectedCardId={selectedCardId}
          animatingToSlot={animatingToSlot}
          selectedCards={selectedCards}
          cardBackImage={cardBackImage}
          handleCardSelect={handleCardSelect}
        />
      </div>
    </div>
  );
};

export default CardSelection;
