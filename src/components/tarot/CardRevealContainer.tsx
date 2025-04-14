
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReadingCard } from '@/types/tarot';
import GlitchText from '@/components/GlitchText';
import CardItem from './CardItem';
import ShareReading from './ShareReading';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';
import CardDetailsDialog from './CardDetailsDialog';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  const [allRevealed, setAllRevealed] = useState(false);
  const [showShareButton, setShowShareButton] = useState(false);
  const [selectedCardDetails, setSelectedCardDetails] = useState<ReadingCard | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  useEffect(() => {
    if (selectedCards.length > 0 && selectedCards.every(card => card.revealed)) {
      setAllRevealed(true);
      
      if (webhookMessage) {
        const timer = setTimeout(() => {
          setShowShareButton(true);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    } else {
      setAllRevealed(false);
      setShowShareButton(false);
    }
  }, [selectedCards, webhookMessage]);
  
  const handleCardReveal = (index: number) => {
    if (loading) {
      console.log("Card click ignored - loading state:", loading);
      return;
    }
    
    console.log("Handling card reveal for index:", index);
    handleCardClick(index);
  };

  const viewCardDetails = (card: ReadingCard) => {
    setSelectedCardDetails(card);
    setIsDetailsOpen(true);
  };
  
  const shareToX = () => {
    const text = `I just got a crypto tarot reading! ${webhookMessage || 'Check out my fortune!'}`;
    const url = window.location.href;
    const hashtags = 'CryptoTarot,FUDFate';
    
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`,
      '_blank'
    );
  };

  console.log("CardRevealContainer rendering with:", {
    selectedCards: selectedCards.length,
    allRevealed,
    loading,
    cardBackImage,
    cardDetails: selectedCards.map(card => ({
      id: card.id,
      name: card.name,
      revealed: card.revealed,
      image: card.image
    }))
  });
  
  return (
    <div className="space-y-8">
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-600 text-sm text-center"
      >
        {!allRevealed 
          ? t('tarot.tapToReveal')
          : t('tarot.allCardsRevealed')}
      </motion.p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <AnimatePresence>
          {selectedCards.map((card, index) => (
            <motion.div
              key={`card-${index}-${card?.id || 'unknown'}`}
              initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotateY: card.revealed ? 0 : 180,
                transition: { 
                  duration: 0.8,
                  delay: index * 0.2
                }
              }}
              whileHover={{
                translateY: -10,
                transition: { duration: 0.3 }
              }}
            >
              <CardItem
                card={card}
                index={index}
                handleCardClick={handleCardReveal}
                isRevealed={card?.revealed}
                loading={loading}
                cardBackImage={cardBackImage}
                onCardView={card.revealed ? () => viewCardDetails(card) : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {allRevealed && webhookMessage && showShareButton && (
        <motion.div 
          className="mt-10 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <GlitchText 
              text={webhookMessage}
              className="text-lg font-medium text-amber-800"
              goldEffect
              intensity="normal"
            />
          </div>
          
          <div className="mt-6 flex flex-col items-center">
            <Button 
              onClick={shareToX}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white"
            >
              <SendHorizontal className="h-4 w-4" />
              {t('tarot.shareOnX')}
            </Button>
          </div>
        </motion.div>
      )}

      <CardDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        cardDetails={selectedCardDetails}
      />
    </div>
  );
};

export default CardRevealContainer;
