import type { FastifyInstance } from 'fastify'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { ZERO_ADDRESS as zeroAddress } from '@primitives/address.utils'

describe('GET routes mocked unit tests', () => {
  let server: FastifyInstance
  beforeAll(async () => {
    process.env.ZEROEX_API_KEY = 'test'
    const { createRouterApiServer } = await import('../../src/server')
    server = createRouterApiServer()
  })
  afterEach(() => vi.unstubAllGlobals())
  afterAll(() => server.close())

  const ensoResponse = {
    gas: '100000',
    amountOut: '990000000',
    priceImpact: 0,
    minAmountOut: '980000000',
    createdAt: 1,
    tx: { data: '0x', to: zeroAddress, from: zeroAddress, value: '0' },
    route: [],
  }

  it('returns an empty response when 0x has no liquidity', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(() => Promise.resolve(Response.json({ liquidityAvailable: false }))),
    )

    const { json, statusCode } = await server.inject({
      url: '/api/router/v1/routes',
      query: {
        chainId: '1',
        tokenIn: [zeroAddress],
        tokenOut: [zeroAddress],
        amountIn: ['1000000000'],
        router: ['0x'],
        userAddress: zeroAddress,
        zapAddress: zeroAddress,
      },
    })

    expect(statusCode).toBe(200)
    expect(json()).toEqual([])
  })

  it('returns an empty response when curve-solver returns no route found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(() => Promise.resolve(Response.json({ error: 'no routes found' }, { status: 404 }))),
    )

    const { json, statusCode } = await server.inject({
      url: '/api/router/v1/routes',
      query: {
        chainId: '1',
        tokenIn: [zeroAddress],
        tokenOut: [zeroAddress],
        amountIn: ['1000000000'],
        router: ['curve-solver'],
        userAddress: zeroAddress,
      },
    })

    expect(statusCode).toBe(200)
    expect(json()).toEqual([])
  })

  // TODO: test 0x slippage and fees
  it.each([
    { slippage: '0.5', expectedSlippage: '50', expectedFee: '0' },
    {
      slippage: '0',
      expectedSlippage: '0',
      feeAmount: ['10000000'],
      ensoFeeAmount: ['5000000'],
      expectedFee: '1.5',
    },
  ])(
    'converts $slippage% slippage and normalizes Enso fees',
    async ({ slippage, expectedSlippage, feeAmount, ensoFeeAmount, expectedFee }) => {
      const fetchMock = vi.fn<typeof fetch>(() =>
        Promise.resolve(Response.json({ ...ensoResponse, feeAmount, ensoFeeAmount })),
      )
      vi.stubGlobal('fetch', fetchMock)

      const { json, statusCode } = await server.inject({
        url: '/api/router/v1/routes',
        query: {
          chainId: '1',
          tokenIn: [zeroAddress],
          tokenOut: [zeroAddress],
          amountIn: ['1000000000'],
          router: ['enso'],
          zapAddress: zeroAddress,
          slippage,
        },
      })

      const request = fetchMock.mock.calls[0][0]
      const url = new URL(request instanceof Request ? request.url : request)
      expect(statusCode).toBe(200)
      expect(json()).toMatchObject([{ routerFeePercentage: expectedFee }])
      expect(url.searchParams.get('slippage')).toBe(expectedSlippage)
      expect(url.searchParams.has('minAmountOut')).toBe(false)
      expect(url.searchParams.has('fee')).toBe(false)
      expect(url.searchParams.has('feeReceiver')).toBe(false)
    },
  )
})
