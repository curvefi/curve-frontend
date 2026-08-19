import type { FastifyInstance } from 'fastify'
import { zeroAddress } from 'viem'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createRouterApiServer } from '../../src/server'

describe('GET routes mocked unit tests', () => {
  let server: FastifyInstance
  beforeAll(() => (server = createRouterApiServer()))
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

  it.each([
    {
      label: 'preserves upstream 4xx statuses',
      router: ['enso'],
      fetchStatuses: [429],
      expectedStatus: 429,
      expectedBody: 'Upstream response',
    },
    {
      label: 'maps upstream 5xx statuses to 502',
      router: ['enso'],
      fetchStatuses: [503],
      expectedStatus: 502,
      expectedBody: 'Upstream failed with status 503',
    },
    {
      label: 'returns the lowest mapped status when all requested routers fail',
      router: ['enso', 'curve-solver'],
      fetchStatuses: [429, 503],
      expectedStatus: 429,
      expectedBody: 'Upstream response',
    },
  ])('$label', async ({ router, fetchStatuses, expectedStatus, expectedBody }) => {
    vi.stubGlobal(
      'fetch',
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      vi.fn<typeof fetch>(() => Promise.resolve(new Response('Upstream response', { status: fetchStatuses.shift() }))),
    )

    const { body, statusCode } = await server.inject({
      url: '/api/router/v1/routes',
      query: {
        chainId: '1',
        tokenIn: [zeroAddress],
        tokenOut: [zeroAddress],
        amountIn: ['1000000000'],
        router,
        userAddress: zeroAddress,
        zapAddress: zeroAddress,
      },
    })

    expect(statusCode).toBe(expectedStatus)
    expect(body).equals(expectedBody)
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
    },
  )
})
