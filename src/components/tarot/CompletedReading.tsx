
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReadingCard } from '@/types/tarot';
import GlitchText from '@/components/GlitchText';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { motion } from 'framer-motion';

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
  
  const cardTitles = ["Past", "Present", "Future"];
  
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-white p-6 rounded-lg border border-amber-300 shadow-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="font-bold mb-4 text-center text-amber-800 text-lg">
          <GlitchText text={t('tarot.finalMessage')} intensity="normal" neonEffect="purple" />
        </h4>
        <p className="italic text-gray-700 text-center leading-relaxed">
          "{finalMessage}"
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {selectedCards.map((card, index) => (
          <motion.div 
            key={card?.id || `card-${index}`}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 + 0.4 }}
          >
            <div className="w-full border-2 border-amber-300 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              {card && (
                <AspectRatio ratio={2/3}>
                  <div className="p-2 h-full flex flex-col">
                    <div className="text-center text-sm font-bold text-amber-700 mb-1 bg-amber-50 p-1 rounded truncate">
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
            <div className="mt-2 bg-amber-100 px-4 py-1 rounded-full text-amber-800 font-medium text-sm">
              {cardTitles[index]}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-center pt-6">
        <Button
          onClick={resetReading}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium px-6 py-2 shadow-sm"
        >
          {t('tarot.startNewReading')}
        </Button>
      </div>
    </motion.div>
  );
};

export default CompletedReading;
