import { Environment } from '@/config/webhooks';

// Extend the Window interface to include the addWebhookLog function
declare global {
  interface Window {
    addWebhookLog?: (log: any) => void;
  }
}

// Key for localStorage
const WEBHOOK_LOGS_KEY = 'webhook_logs';

/**
 * Get stored webhook logs from localStorage
 */
const getStoredLogs = (): any[] => {
  try {
    const logs = localStorage.getItem(WEBHOOK_LOGS_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Error loading webhook logs:', error);
    return [];
  }
}

/**
 * Store webhook logs in localStorage
 */
const storeWebhookLogs = (logs: any[]) => {
  try {
    // Keep only the latest 100 logs to prevent localStorage overflow
    const trimmedLogs = logs.slice(0, 100);
    localStorage.setItem(WEBHOOK_LOGS_KEY, JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('Error saving webhook logs:', error);
  }
}

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
  // Create log entry with UUID
  const log = {
    id: crypto.randomUUID(),
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

  // Save to localStorage
  const logs = getStoredLogs();
  storeWebhookLogs([log, ...logs]);

  // Add to DevTools logs if available
  if (typeof window !== 'undefined' && window.addWebhookLog) {
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
    environment?: Environment 
  }
) => {
  const { url, requestData, responseData, error, status, environment = 'production' } = params;
  logWebhookCall('DeckSelect', url, requestData, responseData, error, status, environment, 'POST');
};
