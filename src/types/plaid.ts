export interface PlaidLinkTokenCreateRequest {
  client_name: string;
  user: {
    client_user_id: string;
  };
  products: string[];
  country_codes: string[];
  language: string;
  webhook?: string;
  redirect_uri?: string;
}

export interface PlaidPublicTokenExchangeRequest {
  public_token: string;
  institution: {
    institution_id: string;
    name: string;
  };
}

export interface PlaidError {
  error_type: string;
  error_code: string;
  error_message: string;
  display_message?: string;
  request_id?: string;
}

export interface PlaidWebhookRequest {
  webhook_type: string;
  webhook_code: string;
  item_id: string;
  error?: PlaidError;
}
