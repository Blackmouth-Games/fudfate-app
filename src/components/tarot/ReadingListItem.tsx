
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Share2 } from "lucide-react";
import ReadingCardPreview from './ReadingCardPreview';

interface Reading {
  id: string;
  date: string;
  question: string;
  cards: number[] | string | any[];
  result?: string;
  response?: string;
}

interface ReadingListItemProps {
  reading: Reading;
  onView: (reading: Reading) => void;
  onShare: (reading: Reading) => void;
  onTwitterShare: (reading: Reading) => void;
  getCardName: (cardId: number, fallbackIndex: number) => string;
  getCardImagePath: (cardId: number) => string;
}

const ReadingListItem: React.FC<ReadingListItemProps> = ({
  reading,
  onView,
  onShare,
  onTwitterShare,
  getCardName,
  getCardImagePath
}) => {
  const { t } = useTranslation();
  const formattedDate = new Date(reading.date).toLocaleDateString();
  
  const cardIds = Array.isArray(reading.cards) ? 
    reading.cards.map(c => {
      if (typeof c === 'number') return c;
      if (typeof c === 'string') return parseInt(c, 10);
      return 0;
    }) : 
    (typeof reading.cards === 'string' && reading.cards.startsWith('[') && reading.cards.endsWith(']')) ?
      JSON.parse(reading.cards) :
      [];
  
  return (
    <div className="border border-amber-200 rounded-lg p-4 hover:bg-amber-50 transition-colors">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Left side: Date and Question */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-amber-800">{formattedDate}</h4>
          </div>
          <p className="font-medium text-gray-700 mb-2">
            {reading.question || t('tarot.noQuestion')}
          </p>
          <p className="text-sm text-gray-700 line-clamp-2">
            {reading.result || reading.response || 
             <span className="text-gray-400 italic">{t('tarot.noResponse')}</span>}
          </p>
        </div>
        
        {/* Center: Cards */}
        <div className="flex-shrink-0 flex items-center">
          <div className="flex gap-1">
            {cardIds.map((cardId, index) => (
              <ReadingCardPreview
                key={`${reading.id}-card-${index}`}
                cardId={cardId}
                index={index}
                cardName={getCardName(cardId, index)}
                imagePath={getCardImagePath(cardId)}
              />
            ))}
          </div>
        </div>

        {/* Right: Buttons */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <Button
            variant="outline" 
            size="sm"
            onClick={() => onView(reading)}
          >
            {t('tarot.view')}
          </Button>
          
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => onShare(reading)}
            title={t('tarot.copyReading')}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReadingListItem;
