# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-03-XX

### Added
- Initial release of the Gemini Crypto TypeScript SDK
- `Gemini` main class for interacting with Gemini Exchange API
- REST API client with support for:
  - Getting ticker information
  - Retrieving balances
  - Placing new orders
  - Symbol details
- WebSocket implementation supporting:
  - Market data streams
  - Order events
  - Heartbeat monitoring
  - Custom message handlers
- Support for both sandbox and live environments
- Comprehensive TypeScript types for API requests and responses
- Error handling with custom `GeminiAPIError` class
- Full test coverage for core functionality
- Development playground for testing and examples

### Security
- Implemented proper API key and secret handling
- Secure WebSocket connection with authentication
- HMAC signature generation for API requests

[0.1.0]: https://github.com/justinhenricks/gemini-crypto-ts-sdk/releases/tag/v0.1.0 