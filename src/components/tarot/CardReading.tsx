
import React from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CardReadingProps {
  className?: string;
}

const CardReading: React.FC<CardReadingProps> = ({ className = '' }) => {
  const { selectedCards, revealCard, loading, finalMessage, resetReading } = useTarot();
  const { t } = useTranslation();

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold">
          {finalMessage 
            ? t('tarot.readingComplete') 
            : t('tarot.revealCards')}
        </h3>
        <p className="text-gray-300 text-sm">
          {finalMessage 
            ? t('tarot.readingCompleteDescription') 
            : t('tarot.revealCardsDescription')}
        </p>
      </div>
      
      {!finalMessage ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {selectedCards.map((card, index) => (
            <div 
              key={card.id}
              className="flex flex-col items-center space-y-3"
            >
              <div 
                className={`aspect-[2/3] w-full max-w-[200px] rounded-lg shadow-lg overflow-hidden 
                  ${card.revealed 
                    ? 'bg-gradient-to-br from-indigo-800 to-purple-900 border border-purple-400/50' 
                    : 'bg-gradient-to-br from-indigo-900 to-purple-900 border border-purple-500/30 cursor-pointer hover:border-purple-400/50 transition-all'
                  }`}
                onClick={() => !card.revealed && !loading && revealCard(index)}
              >
                {card.revealed ? (
                  <div className="p-3 h-full flex flex-col">
                    <div className="text-center font-bold text-purple-200 mb-2">
                      {card.name}
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <img 
                        src={card.image} 
                        alt={card.name} 
                        className="max-h-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-2">
                      <div className="text-4xl mb-2">🃏</div>
                      <div className="text-xs text-purple-300">
                        {loading ? t('common.loading') : t('tarot.clickToReveal')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {card.revealed && (
                <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                  <p className="text-sm italic text-gray-200">
                    "{card.interpretation}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-black/30 p-4 sm:p-6 rounded-lg border border-purple-500/20">
            <h4 className="font-bold mb-3 text-center">
              {t('tarot.finalMessage')}
            </h4>
            <p className="italic text-gray-200 text-center">
              "{finalMessage}"
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {selectedCards.map((card) => (
              <div 
                key={card.id}
                className="aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-indigo-800 to-purple-900 border border-purple-400/30"
              >
                <div className="p-2 h-full flex flex-col">
                  <div className="text-center text-xs font-bold text-purple-200 mb-1">
                    {card.name}
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <img 
                      src={card.image} 
                      alt={card.name} 
                      className="max-h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center pt-4">
            <Button
              onClick={resetReading}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            >
              {t('tarot.newReading')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardReading;
