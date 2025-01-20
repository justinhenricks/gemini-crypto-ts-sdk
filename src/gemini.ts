import { GeminiClient } from "./api-client";
import { GeminiWebSocket } from "./web-socket";
import { GeminiMode, MessageHandler, Subscription } from "./types";

export class Gemini {
    private apiKey: string;
    private apiSecret: string;
    private mode: GeminiMode;
    public api: GeminiClient;

    constructor({ apiKey, apiSecret, mode = "sandbox" }: { apiKey: string, apiSecret: string, mode?: GeminiMode }) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.mode = mode;
        this.api = new GeminiClient({
            apiKey,
            apiSecret,
            mode
        });
    }

    public socket(
        {
            endpoint,
            messageHandler,
            subscriptions,
            onHeartbeat,
            onClose,
            onError,
        }: {
            endpoint: string,
            messageHandler: MessageHandler,
            subscriptions?: Subscription | Subscription[],
            onHeartbeat?: () => void,
            onClose?: () => void,
            // eslint-disable-next-line no-unused-vars
            onError?: (error: Error) => void,
        }
    ): GeminiWebSocket {
        return new GeminiWebSocket({
            endpoint,
            messageHandler,
            apiKey: this.apiKey,
            apiSecret: this.apiSecret,
            onError,
            subscriptions,
            onHeartbeat,
            onClose,
            mode: this.mode,
        });
    }
}
