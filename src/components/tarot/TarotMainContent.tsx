
import React from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import IntentionForm from '@/components/tarot/IntentionForm';
import ReadingHistory from '@/components/tarot/ReadingHistory';
import DeckSelector from '@/components/tarot/DeckSelector';
import { DeckInfo } from '@/utils/deck-utils';

interface TarotMainContentProps {
  activeTab: string;
  historyData: any[];
  isLoadingHistory: boolean;
  availableDecks: DeckInfo[];
  isLoadingDecks: boolean;
}

const TarotMainContent: React.FC<TarotMainContentProps> = ({
  activeTab,
  historyData,
  isLoadingHistory,
  availableDecks,
  isLoadingDecks
}) => {
  return (
    <div className="max-w-4xl mx-auto my-8 w-full">
      <Tabs value={activeTab} className="w-full">
        <TabsContent value="reading" className="mt-0">
          <IntentionForm className="w-full" />
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <ReadingHistory 
            className="w-full" 
            readings={historyData} 
            isLoading={isLoadingHistory} 
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
