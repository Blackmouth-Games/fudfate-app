
import React from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useTranslation } from 'react-i18next';
import GlitchText from '@/components/GlitchText';

interface CardSelectionProps {
  className?: string;
}

const CardSelection: React.FC<CardSelectionProps> = ({ className = '' }) => {
  const { availableCards, selectedCards, selectCard } = useTarot();
  const { t } = useTranslation();
  
  // Card back image
  const cardBackImage = "/lovable-uploads/c2b7a0ee-e304-442a-94a9-dad07ede9c24.png";

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800">
          <GlitchText text={t('tarot.selectCards')} />
        </h3>
        <p className="text-gray-600 text-sm">
          {t('tarot.selectCardsDescription', { selected: selectedCards.length, total: 3 })}
        </p>
      </div>
      
      <div className="relative h-[400px] w-full bg-gradient-to-b from-amber-50/50 to-amber-100/30 rounded-lg my-8 border border-amber-200/30 overflow-hidden">
        {availableCards.map((card, index) => {
          // Calculate random positions with some overlap but ensuring cards are mostly visible
          const randomRotation = Math.floor(Math.random() * 30) - 15; // -15 to 15 degrees
          const randomLeft = Math.floor(Math.random() * 65); // 0 to 65% of container width
          const randomTop = Math.floor(Math.random() * 65); // 0 to 65% of container height
          const randomZIndex = Math.floor(Math.random() * 10) + 1; // 1 to 10 for z-index
          
          return (
            <div
              key={card.id}
              className="absolute cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              style={{
                left: `${randomLeft}%`,
                top: `${randomTop}%`,
                transform: `rotate(${randomRotation}deg)`,
                zIndex: randomZIndex,
                width: '150px',
                height: '225px',
              }}
              onClick={() => selectCard(card.id)}
            >
              <div className="w-full h-full rounded-lg shadow-md overflow-hidden flex items-center justify-center">
                <img 
                  src={cardBackImage} 
                  alt="Tarot Card Back"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="pt-4 border-t border-amber-200">
        <h4 className="text-center font-medium mb-4 text-gray-700">
          {t('tarot.selectedCards', { count: selectedCards.length })}
        </h4>
        
        <div className="flex justify-center space-x-4">
          {Array.from({ length: 3 }).map((_, i) => {
            const selected = selectedCards[i];
            
            return (
              <div
                key={`slot-${i}`}
                className={`w-16 h-24 sm:w-20 sm:h-28 rounded-md ${
                  selected 
                    ? 'bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-400/50' 
                    : 'border border-dashed border-amber-300 bg-white'
                } flex items-center justify-center`}
              >
                {selected ? (
                  <div className="text-2xl">🃏</div>
                ) : (
                  <span className="text-xs text-amber-400">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CardSelection;
