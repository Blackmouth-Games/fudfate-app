
import React from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

interface CardSelectionProps {
  className?: string;
}

const CardSelection: React.FC<CardSelectionProps> = ({ className = '' }) => {
  const { availableCards, selectedCards, selectCard } = useTarot();
  const { t } = useTranslation();

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold">
          {t('tarot.selectCards')}
        </h3>
        <p className="text-gray-300 text-sm">
          {t('tarot.selectCardsDescription', { selected: selectedCards.length, total: 3 })}
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {availableCards.map((card) => (
          <div
            key={card.id}
            className="cursor-pointer hover-scale transition-transform duration-300"
            onClick={() => selectCard(card.id)}
          >
            <div className="aspect-[2/3] bg-gradient-to-br from-black to-gray-900 rounded-lg shadow-lg border border-amber-500/30 overflow-hidden flex items-center justify-center">
              <div className="text-center p-2">
                <div className="text-4xl mb-2">🃏</div>
                <div className="text-xs text-amber-300">
                  {t('tarot.clickToSelect')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-amber-500/20">
        <h4 className="text-center font-medium mb-4">
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
                    ? 'bg-gradient-to-br from-amber-800 to-amber-900 border border-amber-400/50' 
                    : 'border border-dashed border-amber-500/30 bg-black/20'
                } flex items-center justify-center`}
              >
                {selected ? (
                  <div className="text-2xl">🃏</div>
                ) : (
                  <span className="text-xs text-amber-400/60">{i + 1}</span>
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
