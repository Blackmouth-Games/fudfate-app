import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { ReadingCard } from '@/types/tarot';
import { Interpretation } from '@/types/Interpretation';
import CardItem from './CardItem';
import CompletedReading from './CompletedReading';
import RocketCelebration from '@/components/animations/RocketCelebration';
import { useTarot } from '@/contexts/TarotContext';
import tarotCards from '@/data/tarotCards';

interface CardReadingProps {
  selectedCards: ReadingCard[];
  onComplete: () => void;
  onReset: () => void;
}

const CardReading: React.FC<CardReadingProps> = ({ selectedCards, onComplete, onReset }) => {
  const { t } = useTranslation();
  const { selectedDeck, webhookResponse, phase, revealedCardIds, setRevealedCardIds, readingDeck } = useTarot();
  const [isLoading, setIsLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Lógica robusta para obtener el deck real de la tirada
  const deckToUse = webhookResponse?.deck || readingDeck || selectedDeck;
  const deckCards = tarotCards.filter(c => c.deck === deckToUse);

  // Get the actual cards from webhook response
  const webhookCards = webhookResponse?.selected_cards?.map(cardIndex => {
    const card = deckCards[cardIndex];
    if (!card) {
      console.error(`Card not found for index ${cardIndex} in deck ${deckToUse}`);
      return null;
    }
    // Asegura que la imagen termina en .jpg
    let image = card.image;
    if (image && image.endsWith('.png')) {
      image = image.replace('.png', '.jpg');
    }
    return {
      ...card,
      image,
      deck: deckToUse,
      revealed: revealedCardIds.includes(card.id)
    } as ReadingCard;
  }).filter((card): card is NonNullable<typeof card> => card !== null) || [];

  const handleRevealComplete = () => {
    setShowCelebration(true);
    onComplete();
  };

  useEffect(() => {
    if (revealedCardIds.length === webhookCards.length && webhookCards.length > 0) {
      handleRevealComplete();
    }
  }, [revealedCardIds.length, webhookCards.length]);

  if (webhookResponse?.message && revealedCardIds.length === webhookCards.length) {
    return (
      <div className="space-y-6">
        {webhookResponse.question && (
          <Card className="p-6 bg-purple-50/80 backdrop-blur-sm border-purple-200">
            <p className="text-xl font-medium text-center text-purple-900">
              {webhookResponse.question}
            </p>
          </Card>
        )}
        <CompletedReading
          finalMessage={webhookResponse.message}
          selectedCards={webhookCards}
          resetReading={onReset}
          source="reading"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <RocketCelebration 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
      />
      
      <Card className="p-8 bg-white/80 backdrop-blur-sm border-[#3ADDD9]/30">
        <div className="flex flex-col items-center space-y-8">
          <h2 className="text-2xl font-semibold text-center">
            {revealedCardIds.length === 0 ? t('reading.revealYourCards') : t('reading.selectACard')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
            {webhookCards.map((card, index) => (
              <div key={card.id} className="flex flex-col items-center">
                <CardItem
                  card={card}
                  index={index}
                  handleCardClick={() => {
                    if (!revealedCardIds.includes(card.id)) {
                      setRevealedCardIds(prev => [...prev, card.id]);
                    }
                  }}
                  isRevealed={revealedCardIds.includes(card.id)}
                  loading={isLoading}
                  cardBackImage={`/img/cards/${selectedDeck}/99_BACK.jpg`}
                />
              </div>
            ))}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t('reading.interpretingCards')}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CardReading;
