import { config } from 'dotenv';
import { Gemini } from "../";
config();

export const playground = () => {
    const gemini = new Gemini({
        apiKey: process.env.GEMINI_PRODUCTION_API_KEY!,
        apiSecret: process.env.GEMINI_PRODUCTION_API_SECRET!,
        mode: "live"
    });

    gemini.api.getTicker("BTCUSD").then((ticker) => {
        console.log("ticker");
        console.log(ticker);
    });

    gemini.socket({
        endpoint: "/v2/marketdata/BTCUSD",
        messageHandler: (data) => {
            const message = JSON.parse(data.toString());
            console.log(message);
        },
        subscriptions: [
            {
                type: "subscribe",
                subscriptions: [{ name: "candles_1m", symbols: ["BTCUSD"] }],
            },
        ],
    });

    gemini.socket({
        endpoint: "/v1/order/events",
        messageHandler: (data) => {
            const message = JSON.parse(data.toString());
            console.log(message);
        },
    });


}