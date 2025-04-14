
import React from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import IntentionForm from '@/components/tarot/IntentionForm';
import ReadingHistory from '@/components/tarot/ReadingHistory';
import DeckSelector from '@/components/tarot/DeckSelector';
import CardSelection from '@/components/tarot/CardSelection';
import CardReading from '@/components/tarot/CardReading';
import { DeckInfo } from '@/utils/deck-utils';
import { useTarot } from '@/contexts/TarotContext';

interface TarotMainContentProps {
  activeTab: string;
  historyData: any[];
  isLoadingHistory: boolean;
  availableDecks: DeckInfo[];
  isLoadingDecks: boolean;
  todayReadingData?: any;
  showTodayReading?: boolean;
}

const TarotMainContent: React.FC<TarotMainContentProps> = ({
  activeTab,
  historyData,
  isLoadingHistory,
  availableDecks,
  isLoadingDecks,
  todayReadingData,
  showTodayReading
}) => {
  const { phase } = useTarot();
  
  // Adding a console log to verify changes are being applied
  console.log("TarotMainContent rendering with phase:", phase, "and activeTab:", activeTab);
  
  return (
    <div className="max-w-4xl mx-auto my-8 w-full">
      <Tabs value={activeTab} className="w-full">
        <TabsContent value="reading" className="mt-0">
          {phase === 'intention' && (
            <IntentionForm className="w-full" />
          )}
          
          {phase === 'selection' && (
            <CardSelection className="w-full" />
          )}
          
          {(phase === 'reading' || phase === 'complete') && (
            <CardReading className="w-full" />
          )}
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <ReadingHistory 
            className="w-full" 
            readings={historyData} 
            isLoading={isLoadingHistory} 
            todayReadingData={todayReadingData}
            showTodayReading={showTodayReading}
          />
        </TabsContent>
        
        <TabsContent value="decks" className="mt-0">
          <DeckSelector 
            className="w-full" 
            availableDecks={availableDecks}
            isLoading={isLoadingDecks}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TarotMainContent;
