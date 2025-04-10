
// Interface for the webhook log
export interface WebhookLog {
  id: string;
  timestamp: string;
  type: string;
  url: string;
  method?: string;
  request: any;
  response?: any;
  error?: string;
  status?: number;
  environment: string;
}

export interface WebhookRequestOptions {
  url: string;
  data: any;
  environment?: string;
  method?: string;
}

export interface WebhookCallResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}
