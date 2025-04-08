
import React from 'react';
import { useTarot, Deck } from '@/contexts/TarotContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface DeckSelectorProps {
  className?: string;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({ className = '' }) => {
  const { selectedDeck, setSelectedDeck } = useTarot();
  const { t } = useTranslation();

  const handleDeckChange = (value: string) => {
    setSelectedDeck(value as Deck);
  };

  return (
    <Card className={`bg-black/30 border-amber-500/30 ${className}`}>
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-4 text-center text-amber-100">
          {t('tarot.selectDeck')}
        </h3>
        
        <RadioGroup
          value={selectedDeck}
          onValueChange={handleDeckChange}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="deck1" id="deck1" className="mt-1 border-amber-500" />
            <div className="grid gap-1.5">
              <Label htmlFor="deck1" className="font-bold text-amber-100">
                {t('tarot.deck1Name')}
              </Label>
              <p className="text-sm text-gray-300">
                {t('tarot.deck1Description')}
              </p>
              <div className="flex mt-2 space-x-1">
                <img 
                  src="/img/cards/carddeck1/deck1_0_TheDegen.png"
                  alt="Deck 1 Preview"
                  className="h-16 rounded-md shadow-md"
                />
                <img 
                  src="/img/cards/carddeck1/deck1_1_TheMiner.png"
                  alt="Deck 1 Preview"
                  className="h-16 rounded-md shadow-md"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="deck2" id="deck2" className="mt-1 border-amber-500" />
            <div className="grid gap-1.5">
              <Label htmlFor="deck2" className="font-bold text-amber-100">
                {t('tarot.deck2Name')}
              </Label>
              <p className="text-sm text-gray-300">
                {t('tarot.deck2Description')}
              </p>
              <div className="flex mt-2 space-x-1">
                <div className="h-16 w-12 bg-gradient-to-br from-amber-800 to-amber-500 rounded-md shadow-md flex items-center justify-center text-xs text-black font-medium p-1 text-center">
                  {t('tarot.comingSoon')}
                </div>
                <div className="h-16 w-12 bg-gradient-to-br from-amber-800 to-amber-500 rounded-md shadow-md flex items-center justify-center text-xs text-black font-medium p-1 text-center">
                  {t('tarot.comingSoon')}
                </div>
              </div>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default DeckSelector;
