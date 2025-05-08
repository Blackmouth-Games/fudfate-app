import { Environment } from '@/config/webhooks';
import { WebhookLog } from '@/types/webhook';

// Extend the Window interface to include the addWebhookLog function
declare global {
  interface Window {
    addWebhookLog?: (log: WebhookLog) => void;
  }
}

// Event name for webhook logs
const WEBHOOK_LOG_EVENT = 'webhook-log';

// Key for localStorage
const WEBHOOK_LOGS_KEY = 'webhook_logs';

interface WebhookRequest {
  url: string;
  data: any;
  environment?: string;
}

interface WebhookResponse {
  data?: any;
  status?: number;
}

const MAX_LOGS = 100;

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get stored webhook logs from localStorage
 */
const getStoredLogs = (): WebhookLog[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(WEBHOOK_LOGS_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  } catch (error) {
    console.error('Error retrieving webhook logs:', error);
    return [];
  }
}

/**
 * Store webhook log in localStorage and dispatch event
 */
const storeWebhookLog = (log: WebhookLog) => {
  try {
    const logs = getStoredLogs();
    const updatedLogs = [log, ...logs].slice(0, MAX_LOGS);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(WEBHOOK_LOGS_KEY, JSON.stringify(updatedLogs));
    }

    if (typeof window !== 'undefined') {
      const event = new CustomEvent(WEBHOOK_LOG_EVENT, { 
        detail: log,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(event);
    }

    console.log(`[Webhook ${log.type}]`, {
      url: log.url,
      status: log.status,
      environment: log.environment,
      timestamp: log.timestamp
    });
  } catch (error) {
    console.error('Error storing webhook log:', error);
  }
}

/**
 * Log a webhook call
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
): void => {
  const log: WebhookLog = {
    id: uuidv4(),
    type,
    url,
    timestamp: new Date().toISOString(),
    status: status || (error ? 500 : 200),
    error: error ? (error instanceof Error ? error.message : String(error)) : undefined,
    request: requestData,
    response: responseData,
    environment,
    method
  };

  storeWebhookLog(log);
};

/**
 * Log login webhook
 */
export const logLoginWebhook = (
  request: WebhookRequest,
  response: WebhookResponse,
  error?: Error
): void => {
  logWebhookCall(
    'login',
    request.url,
    request.data,
    response.data,
    error,
    response.status,
    request.environment as Environment,
    'POST'
  );
};

/**
 * Log reading webhook
 */
export const logReadingWebhook = (params: { 
  url: string, 
  requestData: any, 
  responseData?: any, 
  error?: any, 
  status?: number, 
  environment?: Environment 
}): void => {
  logWebhookCall(
    'reading',
    params.url,
    params.requestData,
    params.responseData,
    params.error,
    params.status,
    params.environment,
    'POST'
  );
};

/**
 * Log deck webhook
 */
export const logDeckWebhook = (params: { 
  url: string, 
  requestData: any, 
  responseData?: any, 
  error?: any, 
  status?: number, 
  environment?: Environment 
}): void => {
  logWebhookCall(
    'deck',
    params.url,
    params.requestData,
    params.responseData,
    params.error,
    params.status,
    params.environment,
    'POST'
  );
};

/**
 * Log deck select webhook
 */
export const logDeckSelectWebhook = (params: { 
  url: string, 
  requestData: any, 
  responseData?: any, 
  error?: any, 
  status?: number, 
  environment?: Environment 
}): void => {
  logWebhookCall(
    'deck-select',
    params.url,
    params.requestData,
    params.responseData,
    params.error,
    params.status,
    params.environment,
    'POST'
  );
};
