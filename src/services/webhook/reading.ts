
import { WebhookResponse } from '@/types/tarot';
import { callWebhook } from './core';
import { logReadingWebhook } from './logger';
import { toast } from 'sonner';
import { Environment } from '@/config/webhooks';

let pendingReading: Promise<WebhookResponse> | null = null;
let finalResponseReceived = false;

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

  // Reset the final response flag when starting a new reading
  finalResponseReceived = false;

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
    console.log("Returning temporary response while webhook is pending");
    return tempResponse;
  }

  pendingReading = (async () => {
    try {
      console.log(`Calling reading webhook: ${webhookUrl} with userId: ${userId}`);
      
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
        console.error("Webhook call failed:", result.error);
        throw new Error(result.error || 'No data received');
      }

      console.log("Webhook response received:", result.data);
      
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
        
        // Mark this response as non-temporary
        result.data.isTemporary = false;
        finalResponseReceived = true;

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

        console.log("Dispatched readingReady event with data:", result.data);
        return result.data;
      }

      console.error("Invalid webhook response format - missing selected_cards");
      throw new Error('Invalid webhook response format');
    } catch (error) {
      console.error('Error in webhook call:', error);
      // Even on error, dispatch an event to let components know an attempt was made
      window.dispatchEvent(new CustomEvent('readingError', { 
        detail: { error: error instanceof Error ? error.message : String(error) } 
      }));
      throw error;
    } finally {
      // Clear the pending promise after a delay to prevent immediate re-requests
      setTimeout(() => {
        pendingReading = null;
        console.log("Cleared pending reading promise");
      }, 500);
    }
  })();

  console.log("Returning initial temporary response");
  return tempResponse;
};

/**
 * Check if the final webhook response has been received
 */
export const isFinalResponseReceived = (): boolean => {
  return finalResponseReceived;
};

/**
 * Reset the webhook state (for debugging and testing)
 */
export const resetWebhookState = (): void => {
  finalResponseReceived = false;
  pendingReading = null;
};
