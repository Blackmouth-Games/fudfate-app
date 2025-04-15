
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

  // Create temporary response while waiting for actual webhook response
  const tempResponse: WebhookResponse = {
    selected_cards: Array.from({ length: 3 }, () => Math.floor(Math.random() * 21)),
    message: "Selecciona tus cartas del tarot...",
    question: intention || null,
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
      // Make the actual webhook call
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

      // Validate webhook response format
      if (result.data.selected_cards) {
        // Ensure card indices are within valid range
        result.data.selected_cards = result.data.selected_cards.map(index => 
          Math.min(Math.max(0, index), 21)
        );

        // Add the question to the response for display
        if (!result.data.question && intention) {
          result.data.question = intention;
        }

        // Log the webhook response for debugging
        logReadingWebhook({
          url: webhookUrl,
          requestData: { userid: userId, intention },
          responseData: result.data,
          status: result.status,
          environment
        });

        // Dispatch event to notify other components the reading is ready
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
