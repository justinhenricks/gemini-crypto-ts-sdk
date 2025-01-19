import { GeminiClient } from "./gemini-client";
import { GeminiWebSocket } from "./web-sockets/gemini-web-socket";
import { MessageHandler, Subscription } from "./types";

export class Gemini {
    private apiKey: string;
    private apiSecret: string;
    public rest: GeminiClient;

    constructor(apiKey: string, apiSecret: string, mode: "sandbox" | "live" = "sandbox") {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;

        // Initialize the REST client
        this.rest = new GeminiClient({
            apiKey,
            apiSecret,
            mode
        });
    }

    /**
     * Creates a new WebSocket connection
     * @param endpoint The WebSocket endpoint (e.g., "/v1/order/events")
     * @param messageHandler Function to handle incoming messages
     * @param onError Function to handle errors
     * @param options Additional WebSocket options
     */
    public createWebSocket(
        endpoint: string,
        messageHandler: MessageHandler,
        onError: (error: Error) => void,
        subscriptions: Subscription[],
        options?: {
            onHeartbeat?: () => void;
            onClose?: () => void;
        }
    ): GeminiWebSocket {
        return new GeminiWebSocket({
            endpoint,
            messageHandler,
            apiKey: this.apiKey,
            apiSecret: this.apiSecret,
            onError,
            subscriptions,
            ...options
        });
    }
}
