import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Gemini } from './gemini';
import { GeminiClient } from './api-client';
import { GeminiWebSocket } from './web-socket';
import type { MessageHandler, Subscription } from './types';

// Mock dependencies
vi.mock('./api-client');
vi.mock('./web-socket');

describe('Gemini', () => {
    const mockConfig = {
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with default sandbox mode', () => {
            new Gemini(mockConfig);

            expect(GeminiClient).toHaveBeenCalledWith({
                apiKey: mockConfig.apiKey,
                apiSecret: mockConfig.apiSecret,
                mode: 'sandbox'
            });
        });

        it('should initialize with live mode when specified', () => {
            new Gemini({ ...mockConfig, mode: 'live' });

            expect(GeminiClient).toHaveBeenCalledWith({
                apiKey: mockConfig.apiKey,
                apiSecret: mockConfig.apiSecret,
                mode: 'live'
            });
        });
    });

    describe('socket', () => {
        const mockMessageHandler: MessageHandler = vi.fn();
        const mockSubscription: Subscription = { type: 'test', subscriptions: ['btcusd'] };
        const mockEndpoint = 'wss://test.gemini.com';

        it('should create websocket with minimal config', () => {
            const gemini = new Gemini(mockConfig);

            gemini.socket({
                endpoint: mockEndpoint,
                messageHandler: mockMessageHandler,
            });

            expect(GeminiWebSocket).toHaveBeenCalledWith({
                endpoint: mockEndpoint,
                messageHandler: mockMessageHandler,
                apiKey: mockConfig.apiKey,
                apiSecret: mockConfig.apiSecret,
                mode: 'sandbox',
                onError: undefined,
                subscriptions: undefined,
                onHeartbeat: undefined,
                onClose: undefined,
            });
        });

        it('should create websocket with full config', () => {
            const gemini = new Gemini(mockConfig);
            const onHeartbeat = vi.fn();
            const onClose = vi.fn();
            const onError = vi.fn();

            gemini.socket({
                endpoint: mockEndpoint,
                messageHandler: mockMessageHandler,
                subscriptions: mockSubscription,
                onHeartbeat,
                onClose,
                onError,
            });

            expect(GeminiWebSocket).toHaveBeenCalledWith({
                endpoint: mockEndpoint,
                messageHandler: mockMessageHandler,
                apiKey: mockConfig.apiKey,
                apiSecret: mockConfig.apiSecret,
                mode: 'sandbox',
                subscriptions: mockSubscription,
                onHeartbeat,
                onClose,
                onError,
            });
        });

        it('should create websocket with array of subscriptions', () => {
            const gemini = new Gemini(mockConfig);
            const subscriptions: Subscription[] = [
                { type: 'test1', subscriptions: ['btcusd'] },
                { type: 'test2', subscriptions: ['ethusd'] }
            ];

            gemini.socket({
                endpoint: mockEndpoint,
                messageHandler: mockMessageHandler,
                subscriptions,
            });

            expect(GeminiWebSocket).toHaveBeenCalledWith({
                endpoint: mockEndpoint,
                messageHandler: mockMessageHandler,
                apiKey: mockConfig.apiKey,
                apiSecret: mockConfig.apiSecret,
                mode: 'sandbox',
                subscriptions,
                onError: undefined,
                onHeartbeat: undefined,
                onClose: undefined,
            });
        });

        it('should return the websocket instance', () => {
            const gemini = new Gemini(mockConfig);
            const mockWebSocket = {} as GeminiWebSocket;
            vi.mocked(GeminiWebSocket).mockReturnValue(mockWebSocket);

            const result = gemini.socket({
                endpoint: mockEndpoint,
                messageHandler: mockMessageHandler,
            });

            expect(result).toBe(mockWebSocket);
        });
    });
}); 