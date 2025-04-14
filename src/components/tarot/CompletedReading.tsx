
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ReadingCard } from '@/types/tarot';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import GlitchText from '../GlitchText';
import ImageLoader from '../ui/image-loader';

interface CompletedReadingProps {
  finalMessage: string | null;
  selectedCards: ReadingCard[];
  resetReading: () => void;
  hideResetButton?: boolean;
  className?: string;
  onCardClick?: (card: ReadingCard) => void;
}

const CompletedReading: React.FC<CompletedReadingProps> = ({
  finalMessage,
  selectedCards,
  resetReading,
  hideResetButton = false,
  className,
  onCardClick
}) => {
  const { t } = useTranslation();
  
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-wrap justify-center gap-4">
        {selectedCards.map((card, index) => (
          <motion.div
            key={`completed-card-${index}`}
            className={cn(
              "w-24 sm:w-32 md:w-40 rounded-md overflow-hidden shadow-md border-2 border-amber-300", 
              onCardClick ? "cursor-pointer hover:shadow-lg transform transition-transform hover:-translate-y-1" : ""
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.4 }}
            onClick={() => onCardClick && onCardClick(card)}
          >
            <div className="bg-gradient-to-b from-amber-50 to-amber-100 p-1">
              <ImageLoader
                src={card.image}
                alt={card.name}
                className="rounded aspect-[5/8] border border-amber-200"
                fallbackSrc="/img/cards/deck_1/0_TheDegen.jpg"
              />
            </div>
            <div className="p-2 bg-amber-100 text-center">
              <p className="text-xs sm:text-sm font-medium text-amber-800 truncate">
                {card.name}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <p className="text-sm md:text-base whitespace-pre-line">
            {finalMessage}
          </p>
        </CardContent>
      </Card>
      
      {!hideResetButton && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={resetReading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <GlitchText 
              text={t('tarot.newReading')} 
              className="text-white" 
              intensity="normal"
              goldEffect={false}
            />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CompletedReading;
