
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import GlitchText from '@/components/GlitchText';
import tarotCards from '@/data/tarotCards';
import { DeckInfo, getAvailableDecks } from '@/utils/deck-utils';
import { useTarot } from '@/contexts/TarotContext';
import DeckCard from './DeckCard';
import DeckDetailsDialog from './DeckDetailsDialog';
import CardDetailsDialog from './CardDetailsDialog';
import DeckSelectorSkeleton from './DeckSelectorSkeleton';
import { useDeckSelection } from '@/hooks/useDeckSelection';

interface DeckSelectorProps {
  className?: string;
  availableDecks?: DeckInfo[];
  isLoading?: boolean;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({ 
  className = '', 
  availableDecks = [], 
  isLoading = false 
}) => {
  const { t } = useTranslation();
  const { selectedDeck } = useTarot();
  
  const decks = availableDecks.length > 0 ? availableDecks : getAvailableDecks();
  
  // Sort decks: first by ID, then by active status (active first)
  const sortedDecks = [...decks].sort((a, b) => {
    // First compare activation status - active decks first
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }
    // Then sort by ID if both have same activation status
    return parseInt(a.id) - parseInt(b.id);
  });
  
  const {
    openDeckId,
    selectedCard,
    loadedImages,
    selectingDeck,
    handleSelectDeck,
    handleServerSelectDeck,
    openDeckDetails,
    closeDeckDetails,
    viewCard,
    closeCardView
  } = useDeckSelection(decks);

  const deckCards = tarotCards.filter(card => card.deck === openDeckId);
  
  const cardDetails = selectedCard ? 
    deckCards.find(card => card.id === selectedCard) : null;

  if (isLoading) {
    return <DeckSelectorSkeleton className={className} />;
  }

  return (
    <Card className={`border-amber-400/50 shadow-md ${className}`}>
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-center text-gray-800 mb-1">
            <GlitchText text={t('tarot.selectDeck')} />
          </h3>
          <p className="text-gray-600 text-xs">
            {t('cards.decksDescription')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {sortedDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              isSelected={selectedDeck === deck.name}
              isSelecting={selectingDeck}
              onSelect={handleServerSelectDeck}
              onDetailsOpen={openDeckDetails}
              loadedImages={loadedImages}
              t={t}
            />
          ))}
        </div>
      </CardContent>

      <DeckDetailsDialog
        open={!!openDeckId}
        onOpenChange={(open) => !open && closeDeckDetails()}
        deckId={openDeckId}
        decks={decks}
        deckCards={deckCards}
        onCardClick={viewCard}
        t={t}
      />
      
      <CardDetailsDialog
        open={!!selectedCard}
        onOpenChange={(open) => !open && closeCardView()}
        cardDetails={cardDetails}
      />
    </Card>
  );
};

export default DeckSelector;
