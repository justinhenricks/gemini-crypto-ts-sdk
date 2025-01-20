import { createHmac } from "crypto";
import WebSocket from "ws";
import { MessageHandler, Subscription } from "./types";
import { GEMINI_PRODUCTION_WEBSOCKET_BASE_URL, GEMINI_SANDBOX_WEBSOCKET_BASE_URL } from "./constants";

export interface GeminiSocketConstructorParams {
  endpoint: string;
  messageHandler: MessageHandler;
  subscriptions?: Subscription | Subscription[];
  apiKey: string;
  apiSecret: string;
  onHeartbeat?: () => void;
  onClose?: () => void;
  // eslint-disable-next-line no-unused-vars
  onError?: (error: Error) => void;
  mode: "sandbox" | "live";
}

export class GeminiWebSocket {
  protected ws: WebSocket;
  private subscriptions: Subscription | Subscription[] | undefined;
  private endpoint: string;
  private lastHeartbeat: number;
  private heartbeatInterval: NodeJS.Timeout | undefined;
  private headers: {};
  private url: string;
  private messageHandler: MessageHandler;
  private apiKey: string;
  private apiSecret: string;
  private onHeartbeat?: () => void;
  private onClose?: () => void;
  // eslint-disable-next-line no-unused-vars
  private onError?: (error: Error) => void;
  constructor({
    endpoint,
    messageHandler,
    subscriptions,
    apiKey,
    apiSecret,
    onHeartbeat,
    onClose,
    onError,
    mode = "sandbox"
  }: GeminiSocketConstructorParams) {
    try {
      const url = `${mode === "live" ? GEMINI_PRODUCTION_WEBSOCKET_BASE_URL : GEMINI_SANDBOX_WEBSOCKET_BASE_URL}${endpoint}`;
      this.url = url;
      this.endpoint = endpoint;
      this.subscriptions = subscriptions;
      this.lastHeartbeat = Date.now();
      this.heartbeatInterval = undefined;
      this.apiKey = apiKey;
      this.apiSecret = apiSecret;
      this.headers = GeminiWebSocket.createHeaders(endpoint, apiKey, apiSecret);
      this.messageHandler = messageHandler;
      this.onHeartbeat = onHeartbeat || (() => { });
      this.onClose = onClose || (() => { });
      this.onError = onError;
      const wrappedMessageHandler: MessageHandler = (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          if (this.isHeartbeatMessage(message)) {
            this.updateLastHeartbeat();
            this.onHeartbeat?.();
          }
          messageHandler(data);
        } catch (error) {
          console.error(`Error handling message: ${error}`);
        }
      };

      this.ws = new WebSocket(url, { headers: this.headers });
      this.setupEventListeners(wrappedMessageHandler);
    } catch (error) {
      console.error(`Error initializing WebSocket: ${error}`);
      throw error;
    }
  }

  private static createHeaders(endpoint: string, apiKey: string, apiSecret: string) {
    const nonce = Math.floor(Date.now() / 1000);

    // Create the payload
    const payload = {
      request: endpoint,
      nonce,
    };

    // Stringify and Base64 encode the payload
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      "base64"
    );

    // Create the signature
    const signature = createHmac("sha384", apiSecret)
      .update(base64Payload)
      .digest("hex");

    return {
      "X-GEMINI-APIKEY": apiKey,
      "X-GEMINI-PAYLOAD": base64Payload,
      "X-GEMINI-SIGNATURE": signature,
    };
  }

  private setupEventListeners(messageHandler: MessageHandler) {
    this.ws.on("open", this.onOpen.bind(this));
    this.ws.on("message", (data) => messageHandler(data));
    this.ws.on("close", () => this.onCloseWrapper());
    this.ws.on("error", (error) => this.onErrorWrapper(error));
  }

  protected onOpen(): void {
    console.log(`🚀 SUCCESSFULLY CONNECTED TO GEMINI ${this.endpoint} SOCKET!`);
    this.handleSubscriptions();

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (Date.now() - this.lastHeartbeat > 6000) {
        console.log(`Missed ${this.endpoint} heartbeat. Reconnecting...`);
        this.reconnect();
      }
    }, 6000);
  }

  protected handleSubscriptions() {
    try {
      if (!this.subscriptions) return;

      const subscriptionsArray = Array.isArray(this.subscriptions)
        ? this.subscriptions
        : [this.subscriptions];

      subscriptionsArray.forEach((subscription) => {
        this.ws.send(JSON.stringify(subscription));
      });
    } catch (error) {
      console.error(`Error handling subscriptions: ${error}`);
    }
  }

  private isHeartbeatMessage(message: any) {
    return message.type === "heartbeat";
  }

  private updateLastHeartbeat(): void {
    this.lastHeartbeat = Date.now();
  }

  protected async reconnect() {
    try {
      console.log(`Reconnecting to Gemini WebSocket: ${this.endpoint}`);
      this.ws.close();
      this.headers = GeminiWebSocket.createHeaders(this.endpoint, this.apiKey, this.apiSecret);
      const WebSocketConstructor = WebSocket;
      this.ws = new WebSocketConstructor(this.url, { headers: this.headers });
      this.setupEventListeners(this.messageHandler);
    } catch (error) {
      console.error(`Error reconnecting WebSocket: ${error}`);
      // Retry reconnection after delay
      setTimeout(() => this.reconnect(), 5000);
    }
  }

  protected onCloseWrapper() {
    console.log(`DISCONNECTED FROM ${this.endpoint} SOCKET!`);
    this.onClose?.();
  }

  protected onErrorWrapper(error: Error) {
    console.error(`WebSocket ${this.endpoint} error:`, error);
    this.onError?.(error);
  }
}
