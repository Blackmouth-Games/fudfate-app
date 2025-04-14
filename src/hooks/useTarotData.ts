
import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { fetchAvailableDecks, processDecksFromApi } from '@/utils/wallet-connection-utils';
import { convertApiDeckToInternal, DeckInfo } from '@/utils/deck-utils';
import { logDeckWebhook, logWebhookCall } from '@/services/webhook-service';

export const useTarotData = () => {
  const { connected, userData } = useWallet();
  const { t } = useTranslation();
  const { webhooks, environment } = useEnvironment();
  const [activeTab, setActiveTab] = useState('reading');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [availableDecks, setAvailableDecks] = useState<DeckInfo[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);

  // Fetch decks when app loads or when user connects
  useEffect(() => {
    if (connected && userData?.userId) {
      fetchUserDecks();
    }
  }, [connected, userData]);

  // Also fetch history when the user connects
  useEffect(() => {
    if (connected && userData?.userId) {
      fetchUserHistory();
    }
  }, [connected, userData]);

  const fetchUserDecks = async () => {
    if (!userData?.userId) return;
    
    setIsLoadingDecks(true);
    try {
      // Log the deck webhook call
      console.log(`Fetching decks for user ${userData.userId} from ${webhooks.deck}`);
      
      // Get decks from webhook
      const decksData = await fetchAvailableDecks(webhooks.deck, userData.userId, environment);
      console.log("Raw decks data from API:", decksData);
      
      // Log the webhook response
      logDeckWebhook({
        url: webhooks.deck,
        requestData: { userid: userData.userId },
        responseData: decksData,
        status: 200,
        environment: environment
      });
      
      if (Array.isArray(decksData) && decksData.length > 0) {
        // Process API response
        const processedDecks = processDecksFromApi(decksData);
        console.log("Processed decks data:", processedDecks);
        
        // Convert API deck format to internal format
        const formattedDecks = processedDecks.map(deck => convertApiDeckToInternal(deck));
        setAvailableDecks(formattedDecks);
        console.log("Available decks for UI:", formattedDecks);
      } else {
        // If no decks or error, use deck1 as fallback
        console.log("No decks returned from API, using fallback");
        const defaultDeck = convertApiDeckToInternal({
          id: "1",
          name: "deck_1",
          description: "Crypto Classics",
          created_at: new Date().toISOString(),
          url: "",
          is_active: true
        });
        setAvailableDecks([defaultDeck]);
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
      // Log the webhook error
      logDeckWebhook({
        url: webhooks.deck,
        requestData: { userid: userData.userId },
        error: error instanceof Error ? error.message : String(error),
        environment: environment
      });
      
      toast.error(t('errors.deckLoadFailed'), {
        position: 'bottom-center',
      });
      
      // Fallback to showing deck1 only
      const defaultDeck = convertApiDeckToInternal({
        id: "1",
        name: "deck_1",
        description: "Crypto Classics",
        created_at: new Date().toISOString(),
        url: "",
        is_active: true
      });
      setAvailableDecks([defaultDeck]);
    } finally {
      setIsLoadingDecks(false);
    }
  };

  const fetchUserHistory = async () => {
    if (!userData?.userId) return;
    
    setIsLoadingHistory(true);
    try {
      console.log("Calling history webhook with userid:", userData.userId);
      
      // Log the webhook request about to be made
      logWebhookCall('History', webhooks.history, {
        date: new Date().toISOString(),
        userid: userData.userId
      }, null, undefined, undefined, environment);
      
      const response = await fetch(webhooks.history, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toISOString(),
          userid: userData.userId
        }),
      });
      
      // Log the webhook response status
      console.log(`History webhook response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("History webhook response:", data);
      
      // Log the webhook response
      logWebhookCall('History', webhooks.history, {
        date: new Date().toISOString(),
        userid: userData.userId
      }, data, undefined, response.status, environment);
      
      if (data && Array.isArray(data.readings)) {
        setHistoryData(data.readings);
      } else if (data && Array.isArray(data)) {
        setHistoryData(data);
      } else {
        console.warn("Unexpected history data format:", data);
        setHistoryData([]);
      }
    } catch (error) {
      console.error('Error calling history webhook:', error);
      
      // Log the webhook error
      logWebhookCall('History', webhooks.history, {
        date: new Date().toISOString(),
        userid: userData.userId
      }, null, error, undefined, environment);
      
      toast.error(t('errors.historyLoadFailed'), {
        position: 'bottom-center',
      });
      setHistoryData([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
    if (value === 'decks' && userData?.userId && availableDecks.length === 0) {
      await fetchUserDecks();
    } else if (value === 'history' && userData?.userId) {
      await fetchUserHistory();
    }
  };

  return {
    activeTab,
    historyData,
    isLoadingHistory,
    availableDecks,
    isLoadingDecks,
    handleTabChange
  };
};

export default useTarotData;
