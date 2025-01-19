import { config } from 'dotenv';
import { GeminiClient } from "../gemini-client";

// Load .env file
config();

export const playground = () => {
    console.log("Hello from playground.ts");
    console.log("keys?", process.env.GEMINI_PRODUCTION_API_KEY, process.env.GEMINI_PRODUCTION_API_SECRET);

    const gemini = new GeminiClient({
        apiKey: process.env.GEMINI_PRODUCTION_API_KEY!,
        apiSecret: process.env.GEMINI_PRODUCTION_API_SECRET!,
        mode: "live"
    })

    // gemini.getTicker("BTCUSD").then((ticker) => {
    //     console.log(ticker);
    // });

    gemini.getBalances().then((balances) => {
        console.log("balances");
        console.log(balances);
    });
}