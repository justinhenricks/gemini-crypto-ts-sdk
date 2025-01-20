import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GeminiClient } from './api-client'
import { GeminiAPIError } from './errors'
import { NewOrderRequest } from './types'

describe('GeminiClient', () => {
    let client: GeminiClient

    beforeEach(() => {
        client = new GeminiClient({
            apiKey: 'test-api-key',
            apiSecret: 'test-api-secret',
            mode: 'sandbox'
        })

        // Reset fetch mock between tests
        vi.resetAllMocks()
    })

    // Mock global fetch
    global.fetch = vi.fn()

    describe('constructor', () => {
        it('should initialize with sandbox mode by default', () => {
            const client = new GeminiClient({
                apiKey: 'key',
                apiSecret: 'secret',
                mode: 'sandbox'
            })
            expect(client).toBeDefined()
        })

        it('should initialize with live mode', () => {
            const client = new GeminiClient({
                apiKey: 'key',
                apiSecret: 'secret',
                mode: 'live'
            })
            expect(client).toBeDefined()
        })
    })

    describe('public endpoints', () => {
        describe('getTicker', () => {
            it('should fetch ticker data successfully', async () => {
                const mockResponse = {
                    symbol: 'BTCUSD',
                    open: 50000,
                    high: 51000,
                    low: 49000,
                    close: 50500,
                    changes: [50100, 50200, 50300],
                    bid: 50400,
                    ask: 50600
                }

                vi.mocked(fetch).mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockResponse)
                } as Response)

                const result = await client.getTicker('BTCUSD')
                expect(result).toEqual(mockResponse)
                expect(fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/v2/ticker/BTCUSD'),
                    expect.objectContaining({
                        method: 'GET',
                        headers: {}
                    })
                )
            })

            it('should handle ticker error response', async () => {
                const errorResponse = {
                    result: 'error',
                    reason: 'InvalidSymbol',
                    message: 'Invalid symbol'
                }

                vi.mocked(fetch).mockResolvedValueOnce({
                    ok: false,
                    status: 400,
                    statusText: 'Bad Request',
                    json: () => Promise.resolve(errorResponse)
                } as Response)

                await expect(client.getTicker('INVALID')).rejects.toThrow(GeminiAPIError)
            })
        })

        describe('getSymbolDetails', () => {
            it('should fetch symbol details successfully', async () => {
                const mockResponse = {
                    symbol: 'BTCUSD',
                    base_currency: 'BTC',
                    quote_currency: 'USD',
                    tick_size: 0.01,
                    quote_increment: 0.01,
                    min_order_size: '0.00001',
                    status: 'open',
                    wrap_enabled: false,
                    product_type: 'spot',
                    contract_type: 'spot',
                    contract_price_currency: 'USD'
                }

                vi.mocked(fetch).mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockResponse)
                } as Response)

                const result = await client.getSymbolDetails('BTCUSD')
                expect(result).toEqual(mockResponse)
            })
        })
    })

    describe('private endpoints', () => {
        describe('newOrder', () => {
            it('should create new order successfully', async () => {
                const mockResponse = {
                    order_id: '123456',
                    id: '123456',
                    symbol: 'BTCUSD',
                    exchange: 'gemini',
                    avg_execution_price: '0',
                    side: 'buy',
                    type: 'exchange limit',
                    timestamp: '1234567890',
                    timestampms: 1234567890000,
                    is_live: true,
                    is_cancelled: false,
                    is_hidden: false,
                    was_forced: false,
                    executed_amount: '0',
                    remaining_amount: '1',
                    options: [],
                    price: '50000',
                    original_amount: '1'
                }

                vi.mocked(fetch).mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockResponse)
                } as Response)

                const orderRequest: NewOrderRequest = {
                    symbol: 'BTCUSD',
                    amount: '1',
                    price: '50000',
                    side: 'buy' as const,
                    type: 'exchange limit'
                }

                const result = await client.newOrder(orderRequest)
                expect(result).toEqual(mockResponse)
                expect(fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/v1/order/new'),
                    expect.objectContaining({
                        method: 'POST',
                        headers: expect.objectContaining({
                            'X-GEMINI-APIKEY': expect.any(String),
                            'X-GEMINI-PAYLOAD': expect.any(String),
                            'X-GEMINI-SIGNATURE': expect.any(String)
                        })
                    })
                )
            })
        })

        describe('getBalances', () => {
            it('should fetch balances successfully', async () => {
                const mockResponse = [{
                    currency: 'BTC',
                    amount: '1.0',
                    available: '1.0'
                }]

                vi.mocked(fetch).mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockResponse)
                } as Response)

                const result = await client.getBalances()
                expect(result).toEqual(mockResponse)
            })
        })
    })

    describe('error handling', () => {
        it('should handle network errors', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

            await expect(client.getBalances()).rejects.toThrow(GeminiAPIError)
        })

        it('should handle API errors', async () => {
            const errorResponse = {
                result: 'error',
                reason: 'InvalidNonce',
                message: 'Nonce not increasing'
            }

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: () => Promise.resolve(errorResponse)
            } as Response)

            await expect(client.getBalances()).rejects.toThrowError(GeminiAPIError)
        })
    })
}) 