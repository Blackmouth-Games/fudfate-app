import { WebhookResponse } from '@/types/tarot';
import { callWebhook } from './core';
import { logReadingWebhook } from './logger';
import { toast } from 'sonner';
import { Environment } from '@/config/webhooks';

let pendingReading: Promise<WebhookResponse> | null = null;

/**
 * Call the reading webhook to get a tarot reading
 */
export const callReadingWebhook = async (
  webhookUrl: string, 
  userId?: string, 
  intention?: string,
  environment: Environment = 'production'
): Promise<WebhookResponse> => {
  if (!userId) {
    console.error("No user ID available for webhook call");
    throw new Error("No user ID available");
  }

  const tempResponse: WebhookResponse = {
    selected_cards: Array.from({ length: 3 }, () => Math.floor(Math.random() * 21)),
    message: "Selecciona tus cartas del tarot...",
    reading: null,
    cards: null,
    returnwebhoock: null,
    isTemporary: true
  };

  if (pendingReading) {
    return tempResponse;
  }

  pendingReading = (async () => {
    try {
      const result = await callWebhook<WebhookResponse>(
        { 
          url: webhookUrl, 
          data: { userid: userId, intention }, 
          environment 
        },
        'Reading'
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || 'No data received');
      }

      if (result.data.selected_cards && result.data.message) {
        result.data.selected_cards = result.data.selected_cards.map(index => 
          Math.min(Math.max(0, index), 21)
        );

        logReadingWebhook({
          url: webhookUrl,
          requestData: { userid: userId, intention },
          responseData: result.data,
          status: result.status,
          environment
        });

        window.dispatchEvent(new CustomEvent('readingReady', { 
          detail: result.data 
        }));

        return result.data;
      }

      throw new Error('Invalid webhook response format');
    } catch (error) {
      console.error('Error in webhook call:', error);
      throw error;
    } finally {
      pendingReading = null;
    }
  })();

  return tempResponse;
};
