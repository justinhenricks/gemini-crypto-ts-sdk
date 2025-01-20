# Development Guide

This guide will help you set up the project for local development and testing.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher recommended)
- A Gemini account (sandbox or live) with API keys

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/justinhenricks/gemini-crypto-ts-sdk.git
cd gemini-crypto-ts-sdk
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory
```bash
# .env
GEMINI_SANDBOX_API_KEY=your_sandbox_api_key
GEMINI_SANDBOX_API_SECRET=your_sandbox_api_secret
GEMINI_PRODUCTION_API_KEY=your_production_api_key
GEMINI_PRODUCTION_API_SECRET=your_production_api_secret
```

## Development Server

The project includes a development playground where you can test the SDK functionality in real-time.

1. Start the development server:
```bash
npm run dev
```

This will:
- Watch for changes in the TypeScript files
- Automatically restart the server when files change
- Run the code in `src/dev/playground.ts`

## Playground Usage

The `src/dev/playground.ts` file is your sandbox for testing SDK features. Here's an example of what you can do:

```typescript
import { config } from 'dotenv';
import { Gemini } from "../gemini";

// Load .env file
config();

export const playground = async () => {
    // Initialize with sandbox credentials
    const gemini = new Gemini({
        apiKey: process.env.GEMINI_SANDBOX_API_KEY!,
        apiSecret: process.env.GEMINI_SANDBOX_API_SECRET!,
        mode: "sandbox"
    });

    // Test REST API calls
    try {
        const ticker = await gemini.api.getTicker("btcusd");
        console.log("BTC/USD Ticker:", ticker);
    } catch (error) {
        console.error("Error fetching ticker:", error);
    }

    // Test WebSocket streams
    gemini.socket({
        endpoint: "/v2/marketdata/BTCUSD",
        messageHandler: (data) => {
            const message = JSON.parse(data.toString());
            console.log("WebSocket Message:", message);
        },
        subscriptions: [
            {
                type: "subscribe",
                subscriptions: [{ name: "candles_1m", symbols: ["BTCUSD"] }],
            },
        ],
    });
};
```

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Building

To build the package locally:

```bash
npm run build
```

This will create a `dist` directory with the compiled JavaScript files.

## Linting

To run the linter:

```bash
npm run lint
```

## Tips

1. Use the playground file to test new features before implementing them in the SDK
2. Keep the WebSocket connection examples in playground.ts commented out when not in use
3. Watch the console output for real-time API responses
4. Use the sandbox environment for testing to avoid affecting real accounts

## Common Issues

1. "API key not valid" 
   - Double check your .env file configuration
   - Verify API key permissions in your Gemini account

2. WebSocket connection errors
   - Ensure you're using the correct endpoint
   - Check if you need authentication for the specific stream
   - Note that the sandbox environment can be unstable

## Project Structure

```
src/
├── api-client.ts     # REST API implementation
├── web-socket.ts     # WebSocket implementation
├── types.ts          # TypeScript interfaces and types
├── constants.ts      # API URLs and other constants
├── errors.ts         # Custom error classes
├── dev/
│   ├── server.ts     # Development server
│   └── playground.ts # Testing playground
└── tests/
    └── *.test.ts     # Test files
```

## Need Help?

If you run into any issues:
1. Check the [GitHub issues](https://github.com/justinhenricks/gemini-crypto-ts-sdk/issues)
2. Create a new issue if your problem hasn't been reported
3. Include relevant code snippets and error messages in your issue 