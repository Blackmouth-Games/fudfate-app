import { Environment } from '@/config/webhooks';

/**
 * Log a webhook call to localStorage and dispatch an event
 */
export const logWebhookCall = (
  type: string,
  url: string,
  requestData: any,
  responseData: any,
  error: any,
  status?: number,
  environment: Environment = 'production',
  method: string = 'POST'
) => {
  // Create log entry
  const log = {
    type,
    url,
    timestamp: new Date().toISOString(),
    status,
    error: error ? (error instanceof Error ? error.message : String(error)) : undefined,
    request: requestData,
    response: responseData,
    environment,
    method
  };

  // Add to DevTools logs if available
  if (typeof window !== 'undefined' && window.addWebhookLog) {
    // @ts-ignore - Global function added by DevTools
    window.addWebhookLog(log);
  }

  // Log to console for debugging
  console.log(`[${type} Webhook] ${method} ${url}`, {
    status,
    error: log.error,
    timestamp: log.timestamp,
    environment
  });
};

// Specific logging functions for different webhook types
export const logLoginWebhook = (params: { 
  url: string, 
  requestData: any, 
  responseData?: any, 
  error?: any, 
  status?: number, 
  environment?: Environment 
}) => {
  const { url, requestData, responseData, error, status, environment = 'production' } = params;
  logWebhookCall('Login', url, requestData, responseData, error, status, environment);
};

export const logReadingWebhook = (params: { 
  url: string, 
  requestData: any, 
  responseData?: any, 
  error?: any, 
  status?: number, 
  environment?: Environment 
}) => {
  const { url, requestData, responseData, error, status, environment = 'production' } = params;
  logWebhookCall('Reading', url, requestData, responseData, error, status, environment);
};

export const logDeckWebhook = (params: { 
  url: string, 
  requestData: any, 
  responseData?: any, 
  error?: any, 
  status?: number, 
  environment?: Environment 
}) => {
  const { url, requestData, responseData, error, status, environment = 'production' } = params;
  logWebhookCall('Deck', url, requestData, responseData, error, status, environment);
};

export const logDeckSelectWebhook = (
  params: { 
    url: string, 
    requestData: any, 
    responseData?: any, 
    error?: any, 
    status?: number, 
    environment?: string 
  }
) => {
  const { url, requestData, responseData, error, status, environment = 'production' } = params;
  logWebhookCall('DeckSelect', url, requestData, responseData, error, status, environment, 'POST');
};
