import { createHmac } from "crypto";
import { GEMINI_PRODUCTION_API_BASE_URL, GEMINI_SANDBOX_API_BASE_URL } from "./constants";
import { BalanceResponse, NewOrderRequest, NewOrderResponse, Payload, SymbolDetailsResponse, TickerResponse } from "./types";
import { GeminiAPIError } from "./errors";

export class GeminiClient {
  private apiKey: string;
  private apiSecret: string;
  private baseURL: string;

  constructor({
    apiKey,
    apiSecret,
    mode = "sandbox"
  }: {
    apiKey: string;
    apiSecret: string;
    mode: "sandbox" | "live";
  }) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseURL = mode === "sandbox" ? GEMINI_SANDBOX_API_BASE_URL : GEMINI_PRODUCTION_API_BASE_URL;
  }

  private getNonce(): number {
    return Math.floor(Date.now() / 1000);
  }

  private signPayload(payload: Payload): {
    payloadEnc: string;
    signature: string;
  } {
    const payloadEnc = Buffer.from(JSON.stringify(payload)).toString("base64");
    const signature = createHmac("sha384", this.apiSecret)
      .update(payloadEnc)
      .digest("hex");
    return { payloadEnc, signature };
  }

  private async makeRequest(
    endpoint: string,
    method: "GET" | "POST",
    additionalPayload: object = {},
    needAuth: boolean = true
  ): Promise<any> {
    try {
      const url = `${this.baseURL}${endpoint}`;

      const options: RequestInit = {
        method: method,
        headers: {},
      };

      if (needAuth) {
        const payload: Payload = {
          request: endpoint,
          nonce: this.getNonce(),
          ...additionalPayload,
        };

        const { payloadEnc, signature } = this.signPayload(payload);

        options.headers = {
          "Content-Type": "text/plain",
          "Content-Length": "0",
          "X-GEMINI-APIKEY": this.apiKey,
          "X-GEMINI-PAYLOAD": payloadEnc,
          "X-GEMINI-SIGNATURE": signature,
          "Cache-Control": "no-cache",
        };
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json();
        throw new GeminiAPIError(
          `Gemini API Error: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return response.json();
    } catch (error: unknown) {
      if (error instanceof GeminiAPIError) {
        throw error;
      }
      throw new GeminiAPIError(
        'Failed to make request to Gemini API',
        500,
        {
          result: "error",
          reason: "System",
          message: 'Failed to make request to Gemini API',
          originalError: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  // ============================================
  // Public Market Data Methods
  // ============================================
  public async getTicker(symbol: string): Promise<TickerResponse> {
    return this.makeRequest(`/v2/ticker/${symbol}`, "GET", {}, false);
  }

  public async getSymbolDetails(symbol: string): Promise<SymbolDetailsResponse> {
    return this.makeRequest(`/v1/symbols/details/${symbol}`, "GET", {}, false);
  }

  // ============================================
  // Private Trading Methods
  // ============================================
  public async newOrder(orderData: NewOrderRequest): Promise<NewOrderResponse> {
    return this.makeRequest("/v1/order/new", "POST", orderData);
  }

  // ============================================
  // Private Account Methods
  // ============================================
  public async getBalances(): Promise<BalanceResponse[]> {
    return this.makeRequest("/v1/balances", "POST");
  }
}
