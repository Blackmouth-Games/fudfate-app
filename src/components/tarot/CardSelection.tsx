
import React, { useState, useEffect } from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@/contexts/WalletContext';
import GlitchText from '@/components/GlitchText';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCardBackPath } from '@/utils/deck-utils';
import tarotCards from '@/data/tarotCards';

interface CardSelectionProps {
  className?: string;
}

const CardSelection: React.FC<CardSelectionProps> = ({ className = '' }) => {
  const { availableCards, selectedCards, selectCard, loading, selectedDeck, phase } = useTarot();
  const { userData } = useWallet();
  const { t } = useTranslation();
  
  const [allDeckCards, setAllDeckCards] = useState<any[]>([]);
  
  // Use the correct path format for card back images
  const cardBackImage = getCardBackPath(selectedDeck);
  
  // Load all cards from the current deck on component mount or deck change
  useEffect(() => {
    // Get all cards for the selected deck
    const deckCards = tarotCards.filter(card => card.deck === selectedDeck);
    setAllDeckCards(deckCards);
  }, [selectedDeck]);
  
  // Check if user can make readings (userData.runsToday should be true for "can read")
  // Empty state - no cards available or user can't read
  if ((allDeckCards.length === 0 && !loading) || (userData && !userData.runsToday)) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-6 max-w-md mx-auto">
          <div className="mb-4 flex justify-center">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            <GlitchText text={t('tarot.noMoreReadings')} />
          </h3>
          <p className="text-gray-600 text-sm">
            {t('tarot.comeBackTomorrow')}
          </p>
        </div>
      </div>
    );
  }

  const handleCardSelect = (cardId: string) => {
    console.log("Selecting card:", cardId);
    selectCard(cardId);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800">
          <GlitchText text={t('tarot.selectCards')} goldEffect />
        </h3>
        <p className="text-gray-600 text-sm">
          {t('tarot.selectCardsDescription', { selected: selectedCards.length, total: 3 })}
        </p>
      </div>
      
      {/* Display selected cards at the top */}
      <div className="py-4 border-b border-amber-200">
        <h4 className="text-center font-medium mb-4 text-gray-700">
          {t('tarot.selectedCards', { count: selectedCards.length })}
        </h4>
        
        <div className="flex justify-center space-x-6">
          {Array.from({ length: 3 }).map((_, i) => {
            const selected = selectedCards[i];
            
            return (
              <motion.div
                key={`slot-${i}`}
                className={`w-20 h-28 sm:w-24 sm:h-36 rounded-md ${
                  selected 
                    ? 'bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-400/50 shadow-md' 
                    : 'border border-dashed border-amber-300 bg-white'
                } flex items-center justify-center relative overflow-hidden`}
                initial={selected ? { scale: 0.8 } : {}}
                animate={selected ? { scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {loading && !selected ? (
                  <Skeleton className="w-full h-full rounded-md" />
                ) : selected ? (
                  <motion.div 
                    className="h-full w-full flex items-center justify-center"
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img
                      src={cardBackImage}
                      alt="Selected Card"
                      className="h-full w-full object-cover rounded-md"
                      onError={(e) => {
                        // Fallback to default image if the dynamic path fails
                        console.warn(`Failed to load image: ${cardBackImage}, using fallback`);
                        e.currentTarget.src = `/img/cards/deck_1/99_BACK.png`;
                      }}
                    />
                    <motion.div 
                      className="absolute inset-0 bg-amber-400/20 rounded-md"
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                ) : (
                  <span className="text-xs text-amber-400">{i + 1}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* All available cards for selection - improved to display all 22 cards with better overlap */}
      <div className="relative mt-8">
        <h4 className="text-center font-medium mb-4 text-gray-700">
          {t('tarot.availableCards')}
        </h4>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-48">
                  <motion.div 
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Skeleton className="absolute w-full h-full rounded-lg" />
                  </motion.div>
                  <motion.div 
                    animate={{ rotate: [5, -5, 5] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
                  >
                    <Skeleton className="absolute w-full h-full rounded-lg transform rotate-6" />
                  </motion.div>
                  <motion.div 
                    animate={{ rotate: [-2, 8, -2] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
                  >
                    <Skeleton className="absolute w-full h-full rounded-lg transform -rotate-6" />
                  </motion.div>
                </div>
              </div>
              <motion.p 
                className="text-amber-600 font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {t('tarot.preparingCards')}
              </motion.p>
            </div>
          </div>
        ) : (
          <div className="relative h-[65vh] sm:h-[45vh] overflow-hidden">
            <div className="absolute inset-0 px-4">
              <div className="flex flex-wrap justify-center">
                {allDeckCards.map((card, index) => {
                  // Calculate offset for fan-like arrangement
                  const angle = ((index - allDeckCards.length / 2) / allDeckCards.length) * 30;
                  const translateX = index % 2 === 0 ? index * 10 : index * 12;
                  const translateY = index % 3 === 0 ? index * 2 : index % 3 === 1 ? index * 1 : 0;
                  
                  return (
                    <motion.div
                      key={card.id}
                      className="cursor-pointer absolute transform -translate-x-1/2"
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        transition: { duration: 0.3, delay: index * 0.04 }
                      }}
                      whileHover={{ 
                        y: -20, 
                        scale: 1.1, 
                        zIndex: 50,
                        transition: { duration: 0.2 } 
                      }}
                      onClick={() => handleCardSelect(card.id)}
                      style={{
                        left: `${50 + (index - allDeckCards.length / 2) * 5}%`,
                        top: `${50 + translateY}px`,
                        zIndex: index,
                        rotateZ: `${angle}deg`,
                        width: '120px'
                      }}
                    >
                      <div className="w-full aspect-[2/3] rounded-lg shadow-md overflow-hidden flex items-center justify-center border-2 border-amber-200/50 hover:border-amber-400 transition-colors">
                        <motion.img 
                          src={cardBackImage} 
                          alt="Tarot Card Back"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to default image if the dynamic path fails
                            console.warn(`Failed to load image: ${cardBackImage}, using fallback`);
                            e.currentTarget.src = `/img/cards/deck_1/99_BACK.png`;
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Continue button if exactly 3 cards are selected */}
        {selectedCards.length === 3 && (
          <div className="mt-8 flex justify-center">
            <Button 
              variant="default" 
              className="bg-amber-600 hover:bg-amber-700 px-6"
              disabled={loading}
            >
              {t('tarot.continueToReading')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardSelection;
