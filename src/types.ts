export interface BalanceResponse {
  // Define types according to the Gemini API response for balance
  currency: string;
  amount: string;
  available: string;
}

export interface Payload {
  request: string;
  nonce: number;
}

export type OrderExecutionOptions =
  | "maker-or-cancel"
  | "immediate-or-cancel"
  | "fill-or-kill";

export interface NewOrderRequest {
  client_order_id?: string;
  symbol: string;
  amount: string;
  price: string;
  side: "buy" | "sell";
  type: "exchange limit" | "exchange stop limit";
  options?: OrderExecutionOptions[];
  stop_price?: string;
  account?: string;
}

export interface NewOrderResponse {
  order_id: string;
  id: string;
  symbol: string;
  exchange: string;
  avg_execution_price: string;
  client_order_id: string;
  side: string;
  type: string;
  timestamp: string;
  timestampms: number;
  is_live: boolean;
  is_cancelled: boolean;
  is_hidden: boolean;
  was_forced: boolean;
  executed_amount: string;
  remaining_amount: string;
  options: string[];
  price: string;
  original_amount: string;
  // Add any additional fields you need to handle in the response
}

export interface TickerResponse {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  changes: number[];
  bid: number;
  ask: number;
}

export interface SymbolDetailsResponse {
  symbol: string;
  base_currency: string;
  quote_currency: string;
  tick_size: number;
  quote_increment: number;
  min_order_size: string;
  status: string;
  wrap_enabled: boolean;
  product_type: string;
  contract_type: string;
  contract_price_currency: string;
}

export type GeminiErrorReason =
  | "ClientOrderIdTooLong"
  | "ClientOrderIdMustBeString"
  | "ConflictingOptions"
  | "ConflictingAccountName"
  | "EndpointMismatch"
  | "EndpointNotFound"
  | "InsufficientFunds"
  | "InvalidJson"
  | "InvalidNonce"
  | "InvalidOrderType"
  | "InvalidPrice"
  | "InvalidSymbol"
  | "Maintenance"
  | "MarketNotOpen"
  | "RateLimit"
  | "System"
// ... add other error reasons as needed

export interface GeminiErrorResponse {
  result: "error";
  reason: GeminiErrorReason;
  message: string;
  originalError?: string;
}