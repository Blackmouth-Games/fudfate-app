
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Twitter } from "lucide-react";
import CompletedReading from './CompletedReading';
import { ReadingCard } from '@/types/tarot';
import CardDetailsDialog from './CardDetailsDialog';

interface Reading {
  id: string;
  date: string;
  question: string;
  cards: number[] | string | any[];
  result?: string;
  response?: string;
}

interface ReadingDetailsProps {
  reading: Reading;
  viewingCards: ReadingCard[];
  onBack: () => void;
  onCopyToClipboard: (reading: Reading) => void;
  onShareOnTwitter: (reading: Reading) => void;
  resetReading: () => void;
  className?: string;
}

const ReadingDetails: React.FC<ReadingDetailsProps> = ({
  reading,
  viewingCards,
  onBack,
  onCopyToClipboard,
  onShareOnTwitter,
  resetReading,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isCardDetailsOpen, setIsCardDetailsOpen] = React.useState(false);
  const [selectedCardDetails, setSelectedCardDetails] = React.useState<any>(null);
  
  // View card details
  const viewCardDetails = (card: any) => {
    setSelectedCardDetails(card);
    setIsCardDetailsOpen(true);
  };
  
  return (
    <Card className={`border-amber-400/50 shadow-md ${className}`}>
      <CardContent className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-amber-800">
            {reading.question || t('tarot.noQuestion')}
          </h3>
          <Button variant="outline" onClick={onBack}>
            {t('tarot.backToHistory')}
          </Button>
        </div>
        
        <CompletedReading 
          finalMessage={reading.result || reading.response || t('tarot.noMessageAvailable')}
          selectedCards={viewingCards}
          resetReading={resetReading}
          hideResetButton={true}
        />
        
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => onCopyToClipboard(reading)}
            className="w-full sm:w-auto flex items-center gap-2 border-amber-300 hover:bg-amber-50"
          >
            <Share2 className="h-4 w-4" />
            {t('tarot.copyReading')}
          </Button>
          
          <Button
            onClick={() => onShareOnTwitter(reading)}
            className="w-full sm:w-auto flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#0c85d0]"
          >
            <Twitter className="h-4 w-4" />
            {t('tarot.shareOnX')}
          </Button>
        </div>
        
        <CardDetailsDialog 
          open={isCardDetailsOpen} 
          onOpenChange={setIsCardDetailsOpen}
          cardDetails={selectedCardDetails}
        />
      </CardContent>
    </Card>
  );
};

export default ReadingDetails;
