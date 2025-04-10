
import { WebhookResponse } from '@/types/tarot';
import { callWebhook, generateMockData } from './core';
import { logReadingWebhook } from './logger';
import { toast } from 'sonner';

/**
 * Call the reading webhook to get a tarot reading
 */
export const callReadingWebhook = async (
  webhookUrl: string, 
  userId?: string, 
  intention?: string,
  environment: string = 'production'
): Promise<WebhookResponse | null> => {
  if (!userId) {
    console.error("No user ID available for webhook call");
    return null;
  }

  const requestData = {
    date: new Date().toISOString(),
    userid: userId,
    intention: intention
  };

  try {
    console.log("Calling reading webhook with userid:", userId);
    console.log("Using webhook URL:", webhookUrl);
    
    const result = await callWebhook<WebhookResponse>(
      { url: webhookUrl, data: requestData, environment },
      'Reading'
    );
    
    if (result.success) {
      console.log('Reading webhook response:', result.data);
      return result.data;
    }
    
    // For development environment, return mock data
    if (environment === 'development') {
      console.log("Using mock data for development environment");
      const mockData: WebhookResponse = {
        selected_cards: [0, 1, 2],
        message: "This is a mock reading for development purposes.",
        returnwebhoock: JSON.stringify({
          selected_cards: [0, 1, 2],
          message: "This is a mock reading for development purposes."
        })
      };
      
      return generateMockData(mockData, 'Reading', webhookUrl, requestData, environment).data;
    }
    
    toast.error("Error calling reading webhook. Please try again later.", {
      style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
    });
    
    throw new Error(result.error);
  } catch (error) {
    console.error('Error calling reading webhook:', error);
    logReadingWebhook(webhookUrl, requestData, null, error, undefined, environment);
    
    // For development environment, return mock data
    if (environment === 'development') {
      console.log("Using mock data for development environment");
      const mockData: WebhookResponse = {
        selected_cards: [0, 1, 2],
        message: "This is a mock reading for development purposes.",
        returnwebhoock: JSON.stringify({
          selected_cards: [0, 1, 2],
          message: "This is a mock reading for development purposes."
        })
      };
      
      return generateMockData(mockData, 'Reading', webhookUrl, requestData, environment).data;
    }
    
    toast.error("Error calling reading webhook. Please try again later.", {
      style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
    });
    
    // In production, fail the reading
    throw error;
  }
};
