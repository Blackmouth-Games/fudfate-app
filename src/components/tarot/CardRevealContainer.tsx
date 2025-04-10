
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReadingCard } from '@/types/tarot';
import GlitchText from '@/components/GlitchText';
import CardItem from './CardItem';
import { motion } from 'framer-motion';

interface CardRevealContainerProps {
  selectedCards: ReadingCard[];
  handleCardClick: (index: number) => void;
  loading: boolean;
  webhookMessage: string | null;
  cardBackImage: string;
}

const CardRevealContainer: React.FC<CardRevealContainerProps> = ({
  selectedCards,
  handleCardClick,
  loading,
  webhookMessage,
  cardBackImage
}) => {
  const { t } = useTranslation();
  
  // Track which cards have been flipped to prevent multiple flips
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  
  // Handle card click with animation - only allow one flip per card
  const handleCardReveal = async (index: number) => {
    // Check if card is already revealed or is currently being flipped
    if (selectedCards[index]?.revealed || loading || flippedCards[index]) return;
    
    // Mark this card as flipped to prevent multiple flips
    setFlippedCards(prev => ({ ...prev, [index]: true }));
    
    console.log(`Revealing card ${index}`, selectedCards[index]?.id);
    
    // Reveal the card
    setTimeout(() => {
      handleCardClick(index);
    }, 300);
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const cardTitles = ["Past", "Present", "Future"];
  
  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="text-center space-y-3 bg-gradient-to-r from-amber-50/50 to-amber-100/30 rounded-lg py-6 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-bold text-amber-800">
          <GlitchText 
            text={t('tarot.revealCards')} 
            intensity="normal"
            neonEffect="purple"
          />
        </h3>
        <p className="text-amber-700 text-sm max-w-md mx-auto">
          {webhookMessage ? webhookMessage : t('tarot.tapToReveal')}
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-8">
        {selectedCards.map((card, index) => (
          <div key={card?.id || `card-${index}`} className="flex flex-col items-center">
            <CardItem
              card={card}
              index={index}
              handleCardClick={handleCardReveal}
              isRevealed={card?.revealed}
              loading={loading}
              cardBackImage={cardBackImage}
            />
            
            {!card?.revealed && (
              <motion.div 
                className="mt-3 text-sm text-amber-700 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {cardTitles[index]}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CardRevealContainer;
