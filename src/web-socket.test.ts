import { GeminiWebSocket } from './web-socket'
import WebSocket from 'ws'
import { MessageHandler } from './types'
import { GEMINI_PRODUCTION_WEBSOCKET_BASE_URL, GEMINI_SANDBOX_WEBSOCKET_BASE_URL } from './constants'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Mock } from 'vitest'

type MockWebSocket = WebSocket & {
    on: Mock;
    send: Mock;
    close: Mock;
}

const mockWs = {
    on: vi.fn().mockImplementation(() => mockWs),
    send: vi.fn().mockImplementation(() => mockWs),
    close: vi.fn().mockImplementation(() => mockWs),
    // Add required WebSocket properties
    binaryType: 'arraybuffer',
    bufferedAmount: 0,
    extensions: '',
    protocol: '',
    readyState: 0,
    url: '',
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    terminate: vi.fn(),
    ping: vi.fn(),
    pong: vi.fn()
} as unknown as MockWebSocket

vi.mock('ws', () => ({
    default: vi.fn(() => mockWs)
}))

describe('GeminiWebSocket', () => {
    let wsInstance: GeminiWebSocket
    let ws: MockWebSocket
    const mockMessageHandler: MessageHandler = vi.fn()
    const defaultParams = {
        endpoint: '/v1/order/events',
        messageHandler: mockMessageHandler,
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
        mode: 'sandbox' as const
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()
        ws = mockWs  // Use the mockWs directly instead of trying to access mock results
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('constructor', () => {
        it('should initialize with sandbox URL when mode is sandbox', () => {
            wsInstance = new GeminiWebSocket(defaultParams)
            expect(WebSocket).toHaveBeenCalledWith(
                `${GEMINI_SANDBOX_WEBSOCKET_BASE_URL}${defaultParams.endpoint}`,
                expect.any(Object)
            )
        })

        it('should initialize with production URL when mode is live', () => {
            wsInstance = new GeminiWebSocket({
                ...defaultParams,
                mode: 'live'
            })
            expect(WebSocket).toHaveBeenCalledWith(
                `${GEMINI_PRODUCTION_WEBSOCKET_BASE_URL}${defaultParams.endpoint}`,
                expect.any(Object)
            )
        })

        it('should set up event listeners', () => {
            wsInstance = new GeminiWebSocket(defaultParams)
            expect(ws.on).toHaveBeenCalledWith('open', expect.any(Function))
            expect(ws.on).toHaveBeenCalledWith('message', expect.any(Function))
            expect(ws.on).toHaveBeenCalledWith('close', expect.any(Function))
            expect(ws.on).toHaveBeenCalledWith('error', expect.any(Function))
        })
    })

    describe('message handling', () => {
        it('should handle heartbeat messages', () => {
            const onHeartbeat = vi.fn()
            wsInstance = new GeminiWebSocket({
                ...defaultParams,
                onHeartbeat
            })

            // Get the message handler
            const messageHandler = ws.on.mock.calls.find(call => call[0] === 'message')![1]

            // Simulate heartbeat message
            const heartbeatMessage = JSON.stringify({ type: 'heartbeat' })
            messageHandler(heartbeatMessage)

            expect(onHeartbeat).toHaveBeenCalled()
            expect(mockMessageHandler).toHaveBeenCalledWith(heartbeatMessage)
        })

        it('should handle message parsing errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
            wsInstance = new GeminiWebSocket(defaultParams)

            const messageHandler = ws.on.mock.calls.find(call => call[0] === 'message')![1]

            // Invalid JSON message
            messageHandler('invalid json')

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error handling message'))
            consoleSpy.mockRestore()
        })
    })

    describe('subscription handling', () => {
        it('should send single subscription on open', () => {
            const subscription = {
                type: 'subscribe',
                subscriptions: [{
                    type: 'order/events',
                    symbolFilter: ['btcusd']
                }]
            }
            wsInstance = new GeminiWebSocket({
                ...defaultParams,
                subscriptions: subscription
            })

            // Get the open handler
            const openHandler = ws.on.mock.calls.find(call => call[0] === 'open')![1]

            // Simulate WebSocket open
            openHandler()

            expect(ws.send).toHaveBeenCalledWith(JSON.stringify(subscription))
        })

        it('should send multiple subscriptions on open', () => {
            const subscriptions = [
                {
                    type: 'subscribe',
                    subscriptions: [{
                        type: 'order/events',
                        symbolFilter: ['btcusd']
                    }]
                },
                {
                    type: 'subscribe',
                    subscriptions: [{
                        type: 'market/trades',
                        symbolFilter: ['ethusd']
                    }]
                }
            ]
            wsInstance = new GeminiWebSocket({
                ...defaultParams,
                subscriptions
            })

            // Get the open handler
            const openHandler = ws.on.mock.calls.find(call => call[0] === 'open')![1]

            // Simulate WebSocket open
            openHandler()

            subscriptions.forEach(subscription => {
                expect(ws.send).toHaveBeenCalledWith(JSON.stringify(subscription))
            })
        })
    })

    describe('reconnection', () => {
        it('should trigger reconnect when heartbeat is missed', async () => {
            // Create a spy on the reconnect method
            const reconnectSpy = vi.spyOn(GeminiWebSocket.prototype as any, 'reconnect')

            wsInstance = new GeminiWebSocket(defaultParams)

            // Get and trigger the open handler to start the heartbeat interval
            const openHandler = ws.on.mock.calls.find(call => call[0] === 'open')![1]
            openHandler()

            // Simulate initial heartbeat
            const messageHandler = ws.on.mock.calls.find(call => call[0] === 'message')![1]
            messageHandler(JSON.stringify({ type: 'heartbeat' }))

            // Advance time to trigger the first interval check
            vi.advanceTimersByTime(6000)
            expect(reconnectSpy).not.toHaveBeenCalled() // Should not reconnect yet

            // Advance more time to ensure we're past the heartbeat threshold
            vi.advanceTimersByTime(6000)
            expect(reconnectSpy).toHaveBeenCalled() // Now it should reconnect
        })

        it('should create new WebSocket connection when reconnecting', async () => {
            const WebSocketSpy = vi.fn(() => mockWs)
            vi.mocked(WebSocket).mockImplementation(WebSocketSpy)

            wsInstance = new GeminiWebSocket(defaultParams)
            WebSocketSpy.mockClear()

            // Directly call reconnect
            await (wsInstance as any).reconnect()

            // Verify old connection is closed and new one is created
            expect(ws.close).toHaveBeenCalled()
            expect(WebSocketSpy).toHaveBeenCalledWith(
                `${GEMINI_SANDBOX_WEBSOCKET_BASE_URL}${defaultParams.endpoint}`,
                { headers: expect.any(Object) }
            )
        })
    })

    describe('error handling', () => {
        it('should call onError callback when error occurs', () => {
            const onError = vi.fn()
            wsInstance = new GeminiWebSocket({
                ...defaultParams,
                onError
            })

            // Mock error event
            const error = new Error('Test error')
            ws.on.mock.calls.forEach(call => {
                if (call[0] === 'error') {
                    call[1](error)
                }
            })

            expect(onError).toHaveBeenCalledWith(error)
        })

        it('should call onClose callback when connection closes', () => {
            const onClose = vi.fn()
            wsInstance = new GeminiWebSocket({
                ...defaultParams,
                onClose
            })

            // Get the close handler
            const closeHandler = ws.on.mock.calls.find(call => call[0] === 'close')![1]

            closeHandler()

            expect(onClose).toHaveBeenCalled()
        })
    })
}) 