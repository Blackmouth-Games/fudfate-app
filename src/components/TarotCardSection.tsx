
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlitchText from '@/components/GlitchText';
import AnimatedSection from '@/components/AnimatedSection';
import TarotCard from '@/components/TarotCard';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import tarotCards from '@/data/tarotCards';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogClose } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { getCardBackPath } from '@/utils/deck-utils';

// Example cards for the carousel - updated paths to proper format
const exampleCards = [
  { id: 1, title: "The Degen", imageUrl: "/img/cards/deck_1/0_TheDegen.png" },
  { id: 2, title: "The Miner", imageUrl: "/img/cards/deck_1/1_TheMiner.png" },
  { id: 3, title: "The Oracle", imageUrl: "/img/cards/deck_1/2_TheOracle.png" },
  { id: 4, title: "The Wheel", imageUrl: "/img/cards/deck_2/10_wheel of fortune.png" },
];

interface TarotCardSectionProps {
  deckId?: string;
}

const TarotCardSection = ({ deckId = 'deck_1' }: TarotCardSectionProps) => {
  const { t } = useTranslation();
  const cards = exampleCards;
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  
  // Function to get all cards from a specific deck
  const getCardsFromDeck = (deckId: string) => {
    return tarotCards.filter(card => card.deck === deckId);
  };
  
  // Get all cards from the selected deck
  const selectedDeckCards = selectedDeck ? getCardsFromDeck(selectedDeck) : [];

  // Function to handle viewing a specific card in full screen
  const viewCard = (cardId: string) => {
    setSelectedCard(cardId);
  };

  const closeCardView = () => {
    setSelectedCard(null);
  };

  // Find the selected card details
  const cardDetails = selectedCard ? 
    tarotCards.find(card => card.id === selectedCard) : null;

  // Opens the deck dialog when clicking on a deck preview
  const handleDeckClick = (deckId: string) => {
    setSelectedDeck(deckId);
  };

  return (
    <section id="cards" className="py-20 px-4 md:px-8 lg:px-16 relative">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection animation="fade-in" className="mb-16 text-center">
          <div className="mb-6 overflow-visible">
            <GlitchText 
              text={t('cards.title')} 
              goldEffect 
              className="text-3xl md:text-4xl font-pixel-2p text-black inline-block"
            />
          </div>
          <p className="text-lg md:text-xl text-gray-700 font-pixel max-w-3xl mx-auto">
            {t('cards.description')}
          </p>
        </AnimatedSection>
        
        <Carousel 
          className="w-full max-w-5xl mx-auto"
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent className="py-10">
            {cards.map((card, index) => (
              <CarouselItem key={card.id} className="md:basis-1/2 lg:basis-1/3 px-6">
                <div 
                  className="floating cursor-pointer" 
                  style={{ animationDelay: `${0.2 * index}s` }}
                  onClick={() => handleDeckClick(index < 3 ? 'deck_1' : 'deck_2')}
                >
                  <TarotCard 
                    imageUrl={card.imageUrl}
                    title={card.title} 
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-12">
            <CarouselPrevious className="relative static mr-2" />
            <CarouselNext className="relative static ml-2" />
          </div>
        </Carousel>
      </div>

      {/* Dialog to show all cards in a deck */}
      <Dialog open={!!selectedDeck} onOpenChange={(open) => !open && setSelectedDeck(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <GlitchText text={selectedDeck === 'deck_1' ? t('cards.cryptoDeck') : t('cards.classicDeck')} className="text-xl" />
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {selectedDeckCards.map((card) => (
              <div 
                key={card.id} 
                className="aspect-[2/3] cursor-pointer hover:scale-105 transition-transform"
                onClick={() => viewCard(card.id)}
              >
                <TarotCard 
                  imageUrl={card.image}
                  title={card.name} 
                  className="w-full h-full" 
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for individual card view */}
      <Dialog open={!!selectedCard} onOpenChange={(open) => !open && closeCardView()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <GlitchText text={cardDetails?.name || ''} className="text-xl" />
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogHeader>
          <div className="p-4 flex flex-col items-center">
            {cardDetails && (
              <>
                <div className="mb-4 w-full max-w-xs mx-auto">
                  <div className="aspect-[2/3] overflow-hidden rounded-lg border-2 border-amber-400 shadow-lg">
                    <img 
                      src={cardDetails.image} 
                      alt={cardDetails.name} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-amber-200 mt-4 w-full">
                  <h4 className="font-bold mb-2 text-amber-700">{cardDetails.name}</h4>
                  <p className="text-gray-700">{cardDetails.description}</p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TarotCardSection;
