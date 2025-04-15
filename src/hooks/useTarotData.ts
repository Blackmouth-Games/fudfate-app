import { useState, useEffect, useRef } from 'react';
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
  const historyFetchedRef = useRef(false);
  const isHistoryFetchInProgressRef = useRef(false);
  const debugIdRef = useRef(0);

  const getCallContext = () => {
    const stack = new Error().stack;
    const caller = stack?.split('\n')[3] || 'unknown';
    return caller.trim();
  };

  // Consolidated effect for data fetching
  useEffect(() => {
    const fetchData = async () => {
      if (connected && userData?.userId) {
        debugIdRef.current += 1;
        const currentDebugId = debugIdRef.current;
        const callContext = getCallContext();
        
        console.log(`[Debug ${currentDebugId}] Connection state from ${callContext}:`, {
          connected,
          userId: userData.userId,
          historyFetched: historyFetchedRef.current,
          historyInProgress: isHistoryFetchInProgressRef.current,
          activeTab,
          trigger: 'useEffect[connected, userData]'
        });

        // Always fetch decks on connection
        await fetchUserDecks();

        // Only fetch history if not already fetched
        if (!historyFetchedRef.current) {
          console.log(`[Debug ${currentDebugId}] Initiating history fetch from connection effect...`);
          await fetchUserHistory();
        } else {
          console.log(`[Debug ${currentDebugId}] Skipping history fetch - already fetched (connection effect)`);
        }
      }
    };

    fetchData();
  }, [connected, userData]);

  // Reset flags on disconnect
  useEffect(() => {
    if (!connected) {
      const currentDebugId = debugIdRef.current + 1;
      const callContext = getCallContext();
      console.log(`[Debug ${currentDebugId}] Resetting flags due to disconnect from ${callContext}`);
      historyFetchedRef.current = false;
      isHistoryFetchInProgressRef.current = false;
    }
  }, [connected]);

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
    if (!userData?.userId || isHistoryFetchInProgressRef.current) {
      const callContext = getCallContext();
      console.log(`[History] Fetch prevented from ${callContext}:`, {
        hasUserId: !!userData?.userId,
        inProgress: isHistoryFetchInProgressRef.current,
        historyFetched: historyFetchedRef.current,
        trigger: 'fetchUserHistory'
      });
      return;
    }
    
    const currentDebugId = debugIdRef.current;
    const callContext = getCallContext();
    console.log(`[Debug ${currentDebugId}] Starting history fetch from ${callContext}...`);
    isHistoryFetchInProgressRef.current = true;
    setIsLoadingHistory(true);
    
    try {
      console.log(`[Debug ${currentDebugId}] Calling history webhook for user from ${callContext}:`, {
        userId: userData.userId,
        activeTab,
        historyFetched: historyFetchedRef.current
      });
      
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
      historyFetchedRef.current = true;
    } catch (error) {
      console.error(`[Debug ${currentDebugId}] Error calling history webhook from ${callContext}:`, error);
      
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
      console.log(`[Debug ${currentDebugId}] History fetch completed`);
      setIsLoadingHistory(false);
      isHistoryFetchInProgressRef.current = false;
    }
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
    if (value === 'decks' && userData?.userId && availableDecks.length === 0) {
      await fetchUserDecks();
    } else if (value === 'history' && userData?.userId && !historyFetchedRef.current) {
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
