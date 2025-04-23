import { Environment } from '@/config/webhooks';

// Interface for the webhook log
export interface WebhookLog {
  id: string;
  type: string;
  url: string;
  timestamp: string;
  status?: number;
  error?: string;
  request: any;
  response: any;
  environment: Environment;
  method: string;
}

export interface WebhookRequestOptions {
  url: string;
  data: any;
  environment?: Environment;
  method?: string;
}

export interface WebhookCallResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}
