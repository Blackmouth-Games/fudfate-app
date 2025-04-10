
import { WebhookResponse } from '@/types/tarot';
import { toast } from 'sonner';

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

  try {
    console.log("Calling reading webhook with userid:", userId);
    console.log("Using webhook URL:", webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        userid: userId,
        intention: intention
      }),
    });
    
    if (!response.ok) {
      console.error(`Webhook error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Reading webhook response:', data);
    return data;
  } catch (error) {
    console.error('Error calling reading webhook:', error);
    
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
