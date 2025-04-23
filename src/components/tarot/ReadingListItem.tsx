import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Share2, X } from "lucide-react";
import { formatDate } from '@/utils/date-utils';
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
  getCardName: (cardId: string | number) => string;
  getCardImagePath: (cardId: string | number) => string;
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
  
  const cardIds = Array.isArray(reading.cards) ? 
    reading.cards.map(c => {
      if (typeof c === 'number') return c;
      if (typeof c === 'string') return parseInt(c, 10);
      return 0; // Default value if parsing fails
    }) : 
    // Handle string format like "[11, 0, 5]"
    (typeof reading.cards === 'string' && reading.cards.startsWith('[') && reading.cards.endsWith(']')) ?
      JSON.parse(reading.cards) :
      [];
  
  return (
    <div className="bg-white rounded-lg border border-amber-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">{t('tarot.question')}:</p>
            <p className="text-gray-800 font-medium">
              {reading.question || <span className="italic text-gray-400">{t('tarot.noQuestion')}</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onShare(reading)}
              className="flex items-center gap-1 border-amber-300 hover:bg-amber-50"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTwitterShare(reading)}
              className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white border-none"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(reading)}
              className="border-amber-300 hover:bg-amber-50"
            >
              {t('tarot.view')}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">{t('tarot.date')}:</p>
            <p className="text-sm text-gray-700">{formatDate(reading.date)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">{t('tarot.cards')}:</p>
            <p className="text-sm text-gray-700">
              {Array.isArray(reading.cards) 
                ? reading.cards.map(cardId => getCardName(cardId)).join(' • ')
                : t('tarot.noCards')}
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">{t('tarot.response')}:</p>
          <p className="text-sm text-gray-700 line-clamp-3">
            {reading.result || reading.response || 
             <span className="text-gray-400 italic">{t('tarot.noResponse')}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReadingListItem;
