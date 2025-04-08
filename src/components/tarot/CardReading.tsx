
import React from 'react';
import { useTarot } from '@/contexts/TarotContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GlitchText from '@/components/GlitchText';

interface CardReadingProps {
  className?: string;
}

const CardReading: React.FC<CardReadingProps> = ({ className = '' }) => {
  const { selectedCards, revealCard, loading, finalMessage, resetReading } = useTarot();
  const { t } = useTranslation();

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800">
          <GlitchText text={finalMessage 
            ? t('tarot.readingComplete') 
            : t('tarot.revealCards')} 
          />
        </h3>
        <p className="text-gray-600 text-sm">
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
                className={`aspect-[2/3] w-full max-w-[200px] rounded-lg shadow-md overflow-hidden 
                  ${card.revealed 
                    ? 'bg-gradient-to-br from-amber-100 to-white border border-amber-300' 
                    : 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 cursor-pointer hover:border-amber-400 transition-all'
                  }`}
                onClick={() => !card.revealed && !loading && revealCard(index)}
              >
                {card.revealed ? (
                  <div className="p-3 h-full flex flex-col">
                    <div className="text-center font-bold text-amber-700 mb-2">
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
                      <div className="text-xs text-amber-700">
                        {loading ? t('common.loading') : t('tarot.clickToReveal')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {card.revealed && (
                <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-sm">
                  <p className="text-sm italic text-gray-700">
                    "{card.interpretation}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-amber-200 shadow-sm">
            <h4 className="font-bold mb-3 text-center text-gray-800">
              <GlitchText text={t('tarot.finalMessage')} />
            </h4>
            <p className="italic text-gray-700 text-center">
              "{finalMessage}"
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {selectedCards.map((card) => (
              <div 
                key={card.id}
                className="aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-white border border-amber-300 shadow-sm"
              >
                <div className="p-2 h-full flex flex-col">
                  <div className="text-center text-xs font-bold text-amber-700 mb-1">
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
              className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-medium"
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
