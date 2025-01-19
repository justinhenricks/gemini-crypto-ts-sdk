import { config } from 'dotenv';
import { GeminiClient, GeminiWebSocket } from "../index"

import { Gemini } from "../gemini";

// Load .env file
config();

export const playground = () => {
    console.log("Hello from playground.ts");

    // const gemini = new GeminiClient({
    //     apiKey: process.env.GEMINI_PRODUCTION_API_KEY!,
    //     apiSecret: process.env.GEMINI_PRODUCTION_API_SECRET!,
    //     mode: "live"
    // })

    const gemini = new Gemini(process.env.GEMINI_PRODUCTION_API_KEY!, process.env.GEMINI_PRODUCTION_API_SECRET!, "live");

    gemini.rest.getTicker("BTCUSD").then((ticker) => {
        console.log("ticker");
        console.log(ticker);
    });

    gemini.createWebSocket("/v2/marketdata/BTCUSD", (data) => {
        console.log("data");
        console.log(data);
    }, (error) => {
        console.error("error");
        console.error(error);
    }, [
        {
            type: "subscribe",
            subscriptions: [{ name: "candles_1m", symbols: ["BTCUSD"] }],
        },
    ]);

    // gemini.getTicker("BTCUSD").then((ticker) => {
    //     console.log(ticker);
    // });

    // gemini.getBalances().then((balances) => {
    //     console.log("balances");
    //     console.log(balances);
    // });

    // Public ticker
    // const publicWs = new GeminiWebSocket({
    //     endpoint: "/v2/marketdata/BTCUSD",
    //     messageHandler: (data) => {
    //         console.log("message handler")
    //         const message = JSON.parse(data.toString());
    //         console.log(message);
    //     },
    //     api: "public",
    //     onHeartbeat: () => {
    //         console.log("heartbeat kewl");
    //     },
    //     apiKey: process.env.GEMINI_PRODUCTION_API_KEY!,
    //     apiSecret: process.env.GEMINI_PRODUCTION_API_SECRET!,
    //     subscriptions: [
    //         {
    //             type: "subscribe",
    //             subscriptions: [{ name: "candles_1m", symbols: ["BTCUSD"] }],
    //         },
    //     ],
    // });

    // Private order events
    // const ws = new GeminiWebSocket({
    //     endpoint: "/v1/order/events",
    //     messageHandler: (data) => {
    //         console.log("message handler")
    //         const message = JSON.parse(data.toString());
    //         console.log(message);
    //     },
    //     onError: (error) => {
    //         console.error("WebSocket error:", error);
    //     },
    //     onClose: () => {
    //         console.log("WebSocket closed");
    //     },
    //     apiKey: process.env.GEMINI_PRODUCTION_API_KEY!,
    //     apiSecret: process.env.GEMINI_PRODUCTION_API_SECRET!,
    // });
}