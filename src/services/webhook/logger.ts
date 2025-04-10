
import { WebhookLog } from '@/types/webhook';
import { nanoid } from 'nanoid';

/**
 * Log a webhook call to localStorage and dispatch an event
 */
export const logWebhookCall = (
  type: string, 
  url: string, 
  requestData: any, 
  responseData?: any, 
  error?: any, 
  status?: number, 
  environment: string = 'production', 
  method: string = 'POST'
): void => {
  // Filter out pushLogs to Grafana to prevent infinite logging
  if (url.includes('pushLogsToGrafana')) {
    return; // Skip logging for Grafana push logs
  }
  
  const logEntry: WebhookLog = {
    id: nanoid(),
    timestamp: new Date().toISOString(),
    type,
    url,
    method,
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

// Specific logging functions for different webhook types
export const logLoginWebhook = (url: string, requestData: any, responseData?: any, error?: any, status?: number, environment: string = 'production') => {
  logWebhookCall('Login', url, requestData, responseData, error, status, environment, 'POST');
};

export const logReadingWebhook = (url: string, requestData: any, responseData?: any, error?: any, status?: number, environment: string = 'production') => {
  logWebhookCall('Reading', url, requestData, responseData, error, status, environment, 'POST');
};

export const logDeckWebhook = (url: string, requestData: any, responseData?: any, error?: any, status?: number, environment: string = 'production') => {
  logWebhookCall('Deck', url, requestData, responseData, error, status, environment, 'POST');
};

export const logDeckSelectWebhook = (url: string, requestData: any, responseData?: any, error?: any, status?: number, environment: string = 'production') => {
  logWebhookCall('DeckSelect', url, requestData, responseData, error, status, environment, 'POST');
};
