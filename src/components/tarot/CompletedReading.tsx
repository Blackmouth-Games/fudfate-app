
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReadingCard } from '@/types/tarot';
import GlitchText from '@/components/GlitchText';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { motion } from 'framer-motion';
import ShareReading from './ShareReading';

interface CompletedReadingProps {
  finalMessage: string;
  selectedCards: ReadingCard[];
  resetReading: () => void;
  hideResetButton?: boolean; // Added this optional prop
}

const CompletedReading: React.FC<CompletedReadingProps> = ({
  finalMessage,
  selectedCards,
  resetReading,
  hideResetButton = false // Default to false
}) => {
  const { t } = useTranslation();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <div className="space-y-8">
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {selectedCards.map((card, index) => (
          <motion.div 
            key={card?.id || `card-${index}`}
            variants={item}
            className="card-fullview border-2 border-amber-400 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {card && (
              <AspectRatio ratio={5/8}>
                <div className="p-3 h-full flex flex-col">
                  <div className="text-center font-bold text-amber-800 py-1.5 px-2 bg-amber-50 rounded-md mb-2 truncate">
                    {card.name}
                  </div>
                  <div className="flex-1 flex items-center justify-center p-2">
                    <img 
                      src={card.image.replace('.png', '.jpg')} 
                      alt={card.name} 
                      className="max-h-full max-w-full object-contain rounded-md"
                      onError={(e) => {
                        console.warn(`Failed to load card image: ${card.image}, using fallback`);
                        e.currentTarget.src = `/img/cards/deck_1/0_TheDegen.jpg`;
                      }}
                    />
                  </div>
                </div>
              </AspectRatio>
            )}
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        className="bg-white p-6 rounded-lg border-2 border-amber-300 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h4 className="font-bold mb-4 text-center text-xl text-amber-800">
          <GlitchText text={t('tarot.finalMessage')} intensity="normal" neonEffect="purple" />
        </h4>
        <p className="italic text-gray-800 text-center text-lg leading-relaxed">
          "{finalMessage}"
        </p>
      </motion.div>
      
      {!hideResetButton && (
        <motion.div 
          className="flex justify-center pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Button
            onClick={resetReading}
            className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-medium px-6 py-2 text-lg"
          >
            {t('tarot.startNewReading')}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default CompletedReading;
