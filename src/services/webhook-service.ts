
import { WebhookResponse } from '@/types/tarot';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

// Interface for the webhook log
export interface WebhookLog {
  id: string;
  timestamp: string;
  type: string;
  url: string;
  request: any;
  response?: any;
  error?: string;
  status?: number;
  environment: string;
}

const logWebhookCall = (type: string, url: string, requestData: any, responseData?: any, error?: any, status?: number, environment: string = 'production') => {
  // Filter out pushLogs to Grafana to prevent infinite logging
  if (url.includes('pushLogsToGrafana')) {
    return; // Skip logging for Grafana push logs
  }
  
  const logEntry: WebhookLog = {
    id: nanoid(),
    timestamp: new Date().toISOString(),
    type,
    url,
    request: requestData,
    response: responseData,
    error: error ? (error.message || String(error)) : undefined,
    status,
    environment
  };

  // Store in localStorage first to ensure persistence
  try {
    const existingLogs = localStorage.getItem('webhookLogs');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    logs.unshift(logEntry); // Add to the beginning
    const trimmedLogs = logs.slice(0, 50); // Keep only the last 50 logs
    localStorage.setItem('webhookLogs', JSON.stringify(trimmedLogs));
  } catch (err) {
    console.error('Error storing webhook log:', err);
  }

  // Dispatch custom event with the log data
  window.dispatchEvent(new CustomEvent('webhook-log', { detail: logEntry }));
  
  // Also log to console for debugging
  console.log('Webhook log:', logEntry);
};

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
    
    // Log the attempt before actually making the call
    logWebhookCall('Reading', webhookUrl, requestData, null, undefined, undefined, environment);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    const status = response.status;
    
    if (!response.ok) {
      console.error(`Webhook error! status: ${status}`);
      const errorText = await response.text();
      logWebhookCall('Reading', webhookUrl, requestData, null, `HTTP error! status: ${status}`, status, environment);
      
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
        
        // Log the mock response
        logWebhookCall('Reading', webhookUrl, requestData, mockData, undefined, 200, environment);
        
        toast.warning("Using mock reading data for development", {
          description: "Webhook call failed, but continuing with mock data"
        });
        
        return mockData;
      }
      
      throw new Error(`HTTP error! status: ${status}`);
    }
    
    const data = await response.json();
    console.log('Reading webhook response:', data);
    
    // Log successful webhook call
    logWebhookCall('Reading', webhookUrl, requestData, data, undefined, status, environment);
    
    return data;
  } catch (error) {
    console.error('Error calling reading webhook:', error);
    
    // Log failed webhook call
    logWebhookCall('Reading', webhookUrl, requestData, null, error, undefined, environment);
    
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
      
      // Log the mock response
      logWebhookCall('Reading', webhookUrl, requestData, mockData, undefined, 200, environment);
      
      toast.warning("Using mock reading data for development", {
        description: "Webhook call failed, but continuing with mock data"
      });
      
      return mockData;
    }
    
    toast.error("Error calling reading webhook. Please try again later.", {
      style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
    });
    
    // In production, fail the reading
    throw error;
  }
};

// Add export for the logWebhookCall function to be used in WalletContext for login logging
export const logLoginWebhook = (url: string, requestData: any, responseData?: any, error?: any, status?: number, environment: string = 'production') => {
  logWebhookCall('Login', url, requestData, responseData, error, status, environment);
};

// Add specific logging for deck webhook calls
export const logDeckWebhook = (url: string, requestData: any, responseData?: any, error?: any, status?: number, environment: string = 'production') => {
  logWebhookCall('Deck', url, requestData, responseData, error, status, environment);
};

// Make the general webhook logger available for export
export { logWebhookCall };
