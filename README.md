# 🚀 Gemini Crypto TypeScript SDK

A TypeScript SDK for interacting with the Gemini Cryptocurrency Exchange API. This SDK provides a simple interface for both REST and WebSocket APIs.

## Features

- 🔒 Secure authentication handling
- 🔄 Real-time WebSocket data streams
- 💪 Strongly typed responses
- 🎮 Sandbox environment support

## Installation

```bash
npm install gemini-crypto-ts-sdk
```

## Quick Start

```typescript
import { Gemini } from 'gemini-crypto-ts-sdk';

// Initialize the client
const gemini = new Gemini({
    apiKey: 'your-api-key',
    apiSecret: 'your-api-secret',
    mode: 'sandbox' // or 'live'
});

// REST API Examples

// Get ticker info
const ticker = await gemini.api.getTicker('btcusd');

// Place a new order
const order = await gemini.api.newOrder({
    symbol: 'btcusd',
    amount: '100',
    price: '125000',
    side: 'buy',
    type: 'exchange limit',
    options: ["immediate-or-cancel"]
});

// Get account balances
const balances = await gemini.api.getBalances();


// WebSocket Example - Market Data
gemini.socket({
    endpoint: "/v2/marketdata/BTCUSD",
    messageHandler: (data) => {
        const message = JSON.parse(data.toString());
        console.log('Market Data Update:', message);
    },
    subscriptions: [
        {
            type: "subscribe",
            subscriptions: [{ name: "candles_1m", symbols: ["BTCUSD"] }],
        },
    ],
});

// WebSocket Example - Order Events
gemini.socket({
    endpoint: "/v1/order/events",
    messageHandler: (data) => {
        const message = JSON.parse(data.toString());
        console.log('Order Event:', message);
    },
});
```

## Documentation

### REST API

This SDK provides a wrapper for endpoints documented in the [Gemini REST API Documentation](https://docs.gemini.com/rest-api/). It is not exhaustive, PRs are welcome.

Key features include:
- Market Data Order Management
- Account Management
- Trading
- Settlement

### WebSocket API

Real-time data streaming is available as documented in the [Gemini WebSocket API Documentation](https://docs.gemini.com/websocket-api/).

Supported streams:
- Market Data
- Order Events
- Candles
- Trading

## Environment

The SDK supports both production and sandbox environments:

```typescript
// Sandbox Environment
const sandboxClient = new Gemini({
    apiKey: 'sandbox-key',
    apiSecret: 'sandbox-secret',
    mode: 'sandbox'
});

// Production Environment
const productionClient = new Gemini({
    apiKey: 'live-key',
    apiSecret: 'live-secret',
    mode: 'live'
});
```

‼️ Note: The Gemini Sandbox environment seems to be unstable and unreliable at the moment.

## Error Handling

The SDK provides detailed error information through the `GeminiAPIError` class:

```typescript
try {
    await gemini.api.newOrder(/* ... */);
} catch (error) {
    if (error instanceof GeminiAPIError) {
        console.error('API Error:', error.message);
        console.error('Error Code:', error.code);
    }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.
