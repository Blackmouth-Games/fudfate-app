import { WebhookRequestOptions, WebhookCallResult } from '@/types/webhook';
import { logWebhookCall } from './logger';
import { toast } from 'sonner';
import { Environment } from '@/config/webhooks';

// Almacenar las últimas llamadas al webhook
const lastWebhookCalls: { [key: string]: number } = {};
const THROTTLE_TIME = 5000; // 5 segundos entre llamadas

/**
 * Base function to make a webhook call with proper logging
 */
export async function callWebhook<T>(
  options: WebhookRequestOptions, 
  logType: string
): Promise<WebhookCallResult<T>> {
  const { url, data, environment = 'production', method = 'POST' } = options;

  // Create a unique key for this webhook call
  const callKey = `${url}-${JSON.stringify(data)}`;
  const now = Date.now();

  // Check for throttling
  if (lastWebhookCalls[callKey] && (now - lastWebhookCalls[callKey]) < THROTTLE_TIME) {
    console.log(`Webhook call throttled. Last call was ${(now - lastWebhookCalls[callKey])/1000}s ago`);
    return {
      success: false,
      error: 'Throttled: Too many requests'
    };
  }

  // Update last call timestamp
  lastWebhookCalls[callKey] = now;

  // Log the attempt before making the call
  console.log('WebhookCore: Making call:', {
    type: logType,
    url,
    data,
    environment,
    timestamp: new Date().toISOString()
  });
  
  try {
    console.log(`Sending ${method} request to ${url}`);
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const status = response.status;
    console.log(`Received response with status: ${status}`);
    
    // Try to parse the response as JSON, fallback to text
    let responseData: any;
    const contentType = response.headers.get('content-type');
    console.log(`Response content-type: ${contentType}`);
    
    try {
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        console.log('Successfully parsed JSON response:', responseData);
      } else {
        responseData = await response.text();
        console.log('Received text response:', responseData);
        
        // Try to parse as JSON even if content-type is not JSON
        try {
          responseData = JSON.parse(responseData);
          console.log('Successfully parsed text as JSON:', responseData);
        } catch (e) {
          console.log('Response is not JSON format');
        }
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      responseData = await response.text();
      console.log('Fallback to text response:', responseData);
    }
    
    // Log the complete response
    logWebhookCall(logType, url, data, responseData, undefined, status, environment as Environment, method);
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${status}, response:`, responseData);
      throw new Error(`HTTP error! status: ${status}`);
    }
    
    return {
      success: true,
      data: responseData,
      status
    };
  } catch (error) {
    // Log the error with full details
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Webhook call failed:', {
      error: errorMessage,
      type: logType,
      url,
      data,
      environment
    });
    
    logWebhookCall(logType, url, data, null, error, undefined, environment as Environment, method);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Generate mock data for development environment
 */
export function generateMockData<T>(mockData: T, logType: string, url: string, requestData: any, environment: string): WebhookCallResult<T> {
  // Log the mock response for traceability
  logWebhookCall(logType, url, requestData, mockData, undefined, 200, environment as Environment, 'POST');
  
  toast.warning(`Using mock ${logType.toLowerCase()} data for development`, {
    description: "Webhook call failed, but continuing with mock data"
  });
  
  return {
    success: true,
    data: mockData,
    status: 200
  };
}
