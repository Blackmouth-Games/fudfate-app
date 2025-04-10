
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReadingCard } from '@/types/tarot';
import GlitchText from '@/components/GlitchText';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CompletedReadingProps {
  finalMessage: string;
  selectedCards: ReadingCard[];
  resetReading: () => void;
}

const CompletedReading: React.FC<CompletedReadingProps> = ({
  finalMessage,
  selectedCards,
  resetReading
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-amber-200 shadow-md">
        <h4 className="font-bold mb-3 text-center text-gray-800">
          <GlitchText text={t('tarot.finalMessage')} intensity="normal" neonEffect="purple" />
        </h4>
        <p className="italic text-gray-700 text-center">
          "{finalMessage}"
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {selectedCards.map((card, index) => (
          <div 
            key={card?.id || `card-${index}`}
            className="card-fullview border border-amber-300 rounded-lg overflow-hidden"
          >
            {card && (
              <AspectRatio ratio={2/3}>
                <div className="p-2 h-full flex flex-col">
                  <div className="text-center text-xs font-bold text-amber-700 mb-1 bg-amber-50 p-1 rounded truncate">
                    {card.name}
                  </div>
                  <div className="flex-1 flex items-center justify-center p-1">
                    <img 
                      src={card.image} 
                      alt={card.name} 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        console.warn(`Failed to load card image: ${card.image}, using fallback`);
                        e.currentTarget.src = `/img/cards/deck_1/0_TheDegen.png`;
                      }}
                    />
                  </div>
                </div>
              </AspectRatio>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-center pt-4">
        <Button
          onClick={resetReading}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-medium"
        >
          {t('tarot.startNewReading')}
        </Button>
      </div>
    </div>
  );
};

export default CompletedReading;
