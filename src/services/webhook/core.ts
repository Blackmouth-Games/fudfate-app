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

  // Crear una clave única para esta llamada al webhook
  const callKey = `${url}-${JSON.stringify(data)}`;
  const now = Date.now();

  // Verificar si se ha hecho una llamada reciente
  if (lastWebhookCalls[callKey] && (now - lastWebhookCalls[callKey]) < THROTTLE_TIME) {
    console.log(`Webhook call throttled. Last call was ${(now - lastWebhookCalls[callKey])/1000}s ago`);
    return {
      success: false,
      error: 'Throttled: Too many requests'
    };
  }

  // Actualizar el timestamp de la última llamada
  lastWebhookCalls[callKey] = now;

  // Log the attempt before making the call
  console.log('WebhookCore: Logging webhook attempt:', {
    type: logType,
    url,
    data,
    environment
  });
  logWebhookCall(logType, url, data, null, undefined, undefined, environment as Environment, method);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const status = response.status;
    
    // Try to parse the response as JSON, fallback to text
    let responseData: any;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = await response.text();
    }
    
    // Log the response
    logWebhookCall(logType, url, data, responseData, undefined, status, environment as Environment, method);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${status}`);
    }
    
    return {
      success: true,
      data: responseData,
      status
    };
  } catch (error) {
    // Log the error
    const errorMessage = error instanceof Error ? error.message : String(error);
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
