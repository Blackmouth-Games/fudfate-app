
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
import { getCardBackPath, getAvailableDecks, DeckInfo } from '@/utils/deck-utils';
import DeckDetailsDialog from '@/components/tarot/DeckDetailsDialog';
import { motion } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';

// Example cards for the carousel - updated paths to proper format
const exampleCards = [
  { id: 1, title: "The Degen", imageUrl: "/img/cards/deck_1/0_TheDegen.jpg" },
  { id: 2, title: "The Miner", imageUrl: "/img/cards/deck_1/1_TheMiner.jpg" },
  { id: 3, title: "The Oracle", imageUrl: "/img/cards/deck_1/2_TheOracle.jpg" },
  { id: 4, title: "The Wheel", imageUrl: "/img/cards/deck_2/10_wheel of fortune.jpg" },
];

interface TarotCardSectionProps {
  deckId?: string;
}

const TarotCardSection = ({ deckId = 'deck_1' }: TarotCardSectionProps) => {
  const { t } = useTranslation();
  const cards = exampleCards;
  const [openDeckId, setOpenDeckId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hoveredDeck, setHoveredDeck] = useState<number | null>(null);
  
  // Get all available decks
  const availableDecks = getAvailableDecks();
  
  // Function to get all cards from a specific deck
  const getCardsFromDeck = (deckId: string) => {
    // Find the deck name from the deck ID
    const deck = availableDecks.find(d => d.id === deckId);
    if (!deck) return [];
    
    // Filter cards by the deck name
    return tarotCards.filter(card => card.deck === deck.name);
  };
  
  // Get all cards from the selected deck
  const openDeckCards = openDeckId ? getCardsFromDeck(openDeckId) : [];

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
    setOpenDeckId(deckId);
  };

  // Get sample cards from each deck for hover animation
  const getSampleCardsFromDeck = (deckIndex: number) => {
    const deckId = deckIndex < 3 ? 'deck_1' : 'deck_2';
    const deckCards = tarotCards.filter(card => card.deck === deckId);
    
    return {
      card1: deckCards.length > 0 ? deckCards[0].image.replace('.png', '.jpg') : `/img/cards/deck_${deckIndex < 3 ? '1' : '2'}/99_BACK.jpg`,
      card2: deckCards.length > 1 ? deckCards[1].image.replace('.png', '.jpg') : `/img/cards/deck_${deckIndex < 3 ? '1' : '2'}/99_BACK.jpg`
    };
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
            {cards.map((card, index) => {
              const sampleCards = getSampleCardsFromDeck(index);
              return (
                <CarouselItem key={card.id} className="md:basis-1/2 lg:basis-1/3 px-6">
                  <div 
                    className="floating cursor-pointer relative"
                    style={{ animationDelay: `${0.2 * index}s` }}
                    onClick={() => handleDeckClick(index < 3 ? '1' : '2')}
                    onMouseEnter={() => setHoveredDeck(index)}
                    onMouseLeave={() => setHoveredDeck(null)}
                  >
                    {/* Animated deck cards - positioned behind with more pronounced rotation */}
                    {hoveredDeck === index && (
                      <>
                        <motion.div 
                          className="absolute top-0 left-0 w-full z-0"
                          initial={{ rotateZ: -10, x: -15, y: -10 }}
                          animate={{ rotateZ: [-10, -15, -10], x: [-15, -20, -15], y: [-10, -15, -10] }}
                          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                        >
                          <div className="w-full aspect-[5/8] overflow-hidden rounded-lg border-2 border-amber-300 shadow-md">
                            <img 
                              src={sampleCards.card1} 
                              alt="Card Back" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `/img/cards/deck_${index < 3 ? '1' : '2'}/99_BACK.jpg`;
                              }}
                            />
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="absolute top-0 left-0 w-full z-0"
                          initial={{ rotateZ: 10, x: 15, y: -5 }}
                          animate={{ rotateZ: [10, 15, 10], x: [15, 20, 15], y: [-5, -10, -5] }}
                          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.1 }}
                        >
                          <div className="w-full aspect-[5/8] overflow-hidden rounded-lg border-2 border-amber-300 shadow-md">
                            <img 
                              src={sampleCards.card2} 
                              alt="Card Back" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `/img/cards/deck_${index < 3 ? '1' : '2'}/99_BACK.jpg`;
                              }}
                            />
                          </div>
                        </motion.div>
                      </>
                    )}
                    
                    {/* The actual card - positioned in front */}
                    <div className="relative z-10">
                      <TarotCard 
                        imageUrl={card.imageUrl}
                        title={card.title} 
                      />
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="flex justify-center mt-12">
            <CarouselPrevious className="relative static mr-2" />
            <CarouselNext className="relative static ml-2" />
          </div>
        </Carousel>
      </div>

      {/* Use the DeckDetailsDialog component for displaying all cards in a deck */}
      <TooltipProvider>
        <DeckDetailsDialog
          open={!!openDeckId}
          onOpenChange={(open) => !open && setOpenDeckId(null)}
          deckId={openDeckId}
          decks={availableDecks}
          deckCards={openDeckCards}
          t={t}
        />
      </TooltipProvider>

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
                  <div className="aspect-[5/8] overflow-hidden rounded-lg border-2 border-amber-400 shadow-lg">
                    <img 
                      src={cardDetails.image.replace('.png', '.jpg')} 
                      alt={cardDetails.name} 
                      className="w-full h-full object-contain" 
                      onError={(e) => {
                        console.warn(`Failed to load image: ${cardDetails.image.replace('.png', '.jpg')}, using fallback`);
                        e.currentTarget.src = `/img/cards/deck_1/0_TheDegen.jpg`;
                      }}
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
