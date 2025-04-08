
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlitchText from '@/components/GlitchText';
import AnimatedSection from '@/components/AnimatedSection';
import TarotCard from '@/components/TarotCard';
import { getCardsByDeck, tarotDecks } from '@/data/tarotCards';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface TarotCardSectionProps {
  deckId?: string;
}

const TarotCardSection = ({ deckId = 'crypto' }: TarotCardSectionProps) => {
  const { t } = useTranslation();
  const cards = getCardsByDeck(deckId);

  return (
    <section id="cards" className="py-20 px-4 md:px-8 lg:px-16 relative">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection animation="fade-in" className="mb-16 text-center">
          <GlitchText text={t('cards.title')} goldEffect className="text-3xl md:text-4xl font-pixel-2p mb-6 text-black" />
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
                <div className="floating" style={{ animationDelay: `${0.2 * index}s` }}>
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
    </section>
  );
};

export default TarotCardSection;
