import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReadingCard } from '@/types/tarot';
import GlitchText from '@/components/GlitchText';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { motion } from 'framer-motion';
import ShareReading from './ShareReading';

const debug = (type: 'info' | 'error' | 'warn' | 'debug', ...args: any[]) => {
  const styles = {
    info: 'color: #00b894; font-weight: bold;',
    error: 'color: #d63031; font-weight: bold;',
    warn: 'color: #fdcb6e; font-weight: bold;',
    debug: 'color: #0984e3; font-weight: bold;'
  };
  
  console.log(`%c[CompletedReading] ${type.toUpperCase()}:`, styles[type], ...args);
};

interface CompletedReadingProps {
  finalMessage: string;
  selectedCards: ReadingCard[];
  resetReading: () => void;
  hideResetButton?: boolean;
  onCopyToClipboard?: () => void;
  onShareOnTwitter?: () => void;
  source?: 'reading' | 'history';
  question?: string;
}

const CompletedReading: React.FC<CompletedReadingProps> = ({
  finalMessage,
  selectedCards,
  resetReading,
  hideResetButton = false,
  onCopyToClipboard,
  onShareOnTwitter,
  source = 'reading',
  question = ''
}) => {
  const { t } = useTranslation();
  
  // Log the received message
  React.useEffect(() => {
    debug('info', 'Received message:', {
      finalMessage,
      source,
      cardsCount: selectedCards.length,
      hasMessage: !!finalMessage
    });
  }, [finalMessage, source, selectedCards]);
  
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
  
  const displayMessage = React.useMemo(() => {
    if (!finalMessage || !finalMessage.trim()) {
      debug('warn', 'No message provided');
      return t('tarot.noMessageAvailable');
    }
    debug('info', 'Using provided message:', finalMessage);
    return finalMessage;
  }, [finalMessage, t]);
  
  return (
    <div className="space-y-4">
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full min-h-0 min-w-0"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {selectedCards.map((card, index) => (
          <div key={card?.id || `card-${index}`} className="flex flex-col items-center w-full min-w-0 min-h-0">
            <div className="border-2 border-amber-400 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-[240px] min-w-0 min-h-0 flex items-center justify-center">
              {card && (
                <AspectRatio ratio={414/710} className="w-full min-w-0 min-h-0">
                  <img 
                    src={card.image.replace('.png', '.jpg')} 
                    alt={card.name} 
                    className="w-full h-full object-contain bg-black min-w-0 min-h-0"
                    onError={(e) => {
                      console.warn(`Failed to load card image: ${card.image}, using fallback`);
                      e.currentTarget.src = `/img/cards/deck_1/0_TheDegen.jpg`;
                    }}
                  />
                </AspectRatio>
              )}
            </div>
          </div>
        ))}
      </motion.div>
      
      <motion.div 
        className="bg-white p-6 rounded-lg border-2 border-[#3ADDD9] shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h4 className="font-bold mb-4 text-center text-xl text-amber-800">
          <GlitchText text={t('tarot.finalMessage')} intensity="normal" neonEffect="purple" />
        </h4>
        <p className="italic text-gray-800 text-center text-lg leading-relaxed">
          "{displayMessage}"
        </p>
      </motion.div>
      
      <motion.div 
        className="block pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <ShareReading 
          className="w-full sm:w-auto" 
          onCopyToClipboard={onCopyToClipboard}
          onShareOnTwitter={onShareOnTwitter}
          readingData={{
            intention: question,
            selectedCards,
            interpretation: displayMessage,
            finalMessage: displayMessage
          }}
          source={source}
        />
      </motion.div>
    </div>
  );
};

export default CompletedReading;
