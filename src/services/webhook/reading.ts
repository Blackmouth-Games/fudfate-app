
import { WebhookResponse, WebhookArrayResponse, ParsedWebhookData } from '@/types/tarot';
import { callWebhook } from './core';
import { logReadingWebhook } from './logger';
import { toast } from 'sonner';
import { Environment } from '@/config/webhooks';

let pendingReading: Promise<WebhookResponse> | null = null;
let finalResponseReceived = false;
let parsedFinalResponse: WebhookResponse | null = null;

/**
 * Parse webhook data from possibly nested structure
 */
const parseWebhookData = (data: any): ParsedWebhookData => {
  let result: ParsedWebhookData = {};
  
  // Handle array response format
  if (Array.isArray(data) && data.length > 0) {
    console.log("Parsing array webhook response:", data);
    
    // Try to get first item in the array
    const firstItem = data[0];
    
    // Try to parse returnwebhoock if it exists
    if (firstItem.returnwebhoock && typeof firstItem.returnwebhoock === 'string') {
      try {
        const parsedReturnData = JSON.parse(firstItem.returnwebhoock);
        console.log("Successfully parsed returnwebhoock in array response:", parsedReturnData);
        
        if (Array.isArray(parsedReturnData.selected_cards)) {
          result.selected_cards = parsedReturnData.selected_cards;
        }
        
        if (parsedReturnData.message) {
          result.message = parsedReturnData.message;
        }
        
        if (parsedReturnData.question) {
          result.question = parsedReturnData.question;
        }
      } catch (error) {
        console.error("Error parsing returnwebhoock in array response:", error);
      }
    }
    
    // If direct properties exist, use them as fallback
    if (!result.message && firstItem.message) {
      result.message = firstItem.message;
    }
    
    if (!result.question && firstItem.question) {
      result.question = firstItem.question;
    }
    
    // Direct access to selected_cards
    if (!result.selected_cards && Array.isArray(firstItem.selected_cards)) {
      result.selected_cards = firstItem.selected_cards;
    }
    
    return result;
  }
  
  // Handle object response format
  if (data && typeof data === 'object') {
    // Try to get direct properties first
    if (Array.isArray(data.selected_cards)) {
      result.selected_cards = data.selected_cards;
      console.log("Found selected_cards directly in webhook object:", data.selected_cards);
    }
    
    if (data.message) {
      result.message = data.message;
    }
    
    if (data.question) {
      result.question = data.question;
    }
    
    // Try to parse returnwebhoock if it exists
    if (data.returnwebhoock && typeof data.returnwebhoock === 'string') {
      try {
        const parsedData = JSON.parse(data.returnwebhoock);
        console.log("Successfully parsed returnwebhoock in object response:", parsedData);
        
        // Only use these if not already set
        if (!result.selected_cards && Array.isArray(parsedData.selected_cards)) {
          result.selected_cards = parsedData.selected_cards;
        }
        
        if (!result.message && parsedData.message) {
          result.message = parsedData.message;
        }
        
        if (!result.question && parsedData.question) {
          result.question = parsedData.question;
        }
      } catch (error) {
        console.error("Error parsing returnwebhoock in object response:", error);
      }
    }
  }
  
  return result;
};

/**
 * Convert parsed data to a complete webhook response
 */
const createWebhookResponse = (
  parsedData: ParsedWebhookData,
  originalResponse: any,
  isTemporary: boolean = false
): WebhookResponse => {
  // Ensure selected_cards exists and is an array
  const selectedCards = Array.isArray(parsedData.selected_cards) 
    ? parsedData.selected_cards 
    : (isTemporary ? Array.from({ length: 3 }, () => Math.floor(Math.random() * 21)) : []);
  
  if (selectedCards.length === 0 && !isTemporary) {
    console.warn("No selected_cards found in webhook response, using placeholder values");
    // Use placeholder values if none provided in non-temporary response
    selectedCards.push(0, 1, 2);
  }
  
  return {
    selected_cards: selectedCards,
    message: parsedData.message || "No message available",
    question: parsedData.question,
    returnwebhoock: originalResponse.returnwebhoock || null,
    isTemporary: isTemporary
  };
};

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
  parsedFinalResponse = null;

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
      const result = await callWebhook<any>(
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

      console.log("Reading webhook raw response received:", result.data);
      
      // Parse the webhook data
      const parsedData = parseWebhookData(result.data);
      console.log("Parsed webhook data:", parsedData);
      
      // Log the selected cards specifically for debugging
      if (parsedData.selected_cards) {
        console.log("Final selected_cards from webhook:", parsedData.selected_cards);
      } else {
        console.error("No selected_cards found in webhook response!");
      }
      
      // Create a complete webhook response
      const finalResponse = createWebhookResponse(parsedData, result.data, false);
      console.log("Created final webhook response:", finalResponse);
      
      // Store the parsed response for retrieval
      parsedFinalResponse = finalResponse;
      finalResponseReceived = true;

      // Log the webhook response for debugging
      logReadingWebhook({
        url: webhookUrl,
        requestData: { userid: userId, intention },
        responseData: finalResponse,
        status: result.status,
        environment
      });

      // Dispatch event to notify other components the reading is ready
      window.dispatchEvent(new CustomEvent('readingReady', { 
        detail: finalResponse 
      }));

      console.log("Dispatched readingReady event with data:", finalResponse);
      return finalResponse;
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
 * Get the final parsed webhook response if available
 */
export const getFinalWebhookResponse = (): WebhookResponse | null => {
  return parsedFinalResponse;
};

/**
 * Reset the webhook state (for debugging and testing)
 */
export const resetWebhookState = (): void => {
  finalResponseReceived = false;
  pendingReading = null;
  parsedFinalResponse = null;
};
