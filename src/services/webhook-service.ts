
import { WebhookResponse } from '@/types/tarot';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'nanoid';

const logWebhookCall = (type: string, url: string, requestData: any, responseData?: any, error?: any, status?: number) => {
  const logEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    type,
    url,
    request: requestData,
    response: responseData,
    error: error ? (error.message || String(error)) : undefined,
    status
  };

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
      logWebhookCall('Reading', webhookUrl, requestData, null, `HTTP error! status: ${status}`, status);
      throw new Error(`HTTP error! status: ${status}`);
    }
    
    const data = await response.json();
    console.log('Reading webhook response:', data);
    
    // Log successful webhook call
    logWebhookCall('Reading', webhookUrl, requestData, data, undefined, status);
    
    return data;
  } catch (error) {
    console.error('Error calling reading webhook:', error);
    
    // Log failed webhook call
    logWebhookCall('Reading', webhookUrl, requestData, null, error);
    
    // In development, we allow continuing without the webhook
    if (environment === 'development') {
      toast.error("Error calling reading webhook. Using fallback data in development mode.", {
        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #DC2626' }
      });
      return null;
    }
    
    // In production, we fail the reading
    throw error;
  }
};
