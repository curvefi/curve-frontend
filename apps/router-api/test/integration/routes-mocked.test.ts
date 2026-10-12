import type { FastifyInstance } from 'fastify'
import { zeroAddress } from 'viem'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

const WETH_CONTROLLER = '0x23F5a668A9590130940eF55964ead9787976f2CC'
const getFetchUrl = (request: Parameters<typeof fetch>[0]) =>
  new URL(request instanceof Request ? request.url : request)

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

  const testCases = [
    // WETH/crvUSD -  blue chip
    { controllerAddress: WETH_CONTROLLER, feeBps: '6' },
    // svZCHF/crvUSD - long tail
    { controllerAddress: '0xFd85e847cDd2549f213E276e4B57B0690169F043', feeBps: '10' },
    // syrupUSDC/crvUSD - correlated
    { controllerAddress: '0x2fb54c8eae57767A9A509A395b9C4FA0702e2675', feeBps: '2' },
  ]

  it.each(testCases)(
    'applies $feeBps bps for the controller $controllerAddress',
    async ({ controllerAddress, feeBps }) => {
      const amountIn = 1_000_000_000
      const feeAmount = ((amountIn * Number(feeBps)) / 10_000).toString()
      const feePercentage = (Number(feeBps) / 100).toString()
      const fetchMock = vi.fn<typeof fetch>(() =>
        Promise.resolve(Response.json({ ...ensoResponse, feeAmount: [feeAmount] })),
      )
      vi.stubGlobal('fetch', fetchMock)

      const { json, statusCode } = await server.inject({
        url: '/api/router/v1/routes',
        query: {
          chainId: '1',
          tokenIn: [zeroAddress],
          tokenOut: ['0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E'],
          amountIn: [amountIn.toString()],
          router: ['enso'],
          zapAddress: zeroAddress,
          controllerAddress,
        },
      })

      expect(statusCode).toBe(200)
      expect(json()).toMatchObject([{ router: 'enso', routerFeePercentage: feePercentage }])
      expect(fetchMock).toHaveBeenCalledOnce()
      const url = getFetchUrl(fetchMock.mock.calls[0][0])
      expect(url.searchParams.get('fee')).toBe(feeBps)
    },
  )

  it('applies the flat fee to enso routes when no controller is given', async () => {
    const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(Response.json(ensoResponse)))
    vi.stubGlobal('fetch', fetchMock)

    const { statusCode } = await server.inject({
      url: '/api/router/v1/routes',
      query: {
        chainId: '1',
        tokenIn: [zeroAddress],
        tokenOut: [zeroAddress],
        amountIn: ['1000000000'],
        router: ['enso'],
        zapAddress: zeroAddress,
      },
    })

    expect(statusCode).toBe(200)
    const url = getFetchUrl(fetchMock.mock.calls[0][0])
    expect(url.searchParams.get('fee')).toBe('2')
  })

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
        controllerAddress: WETH_CONTROLLER,
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
    { slippage: '0', expectedSlippage: '0', feeAmount: ['10000000'], ensoFeeAmount: ['5000000'], expectedFee: '1.5' },
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
          controllerAddress: WETH_CONTROLLER,
          slippage,
        },
      })

      const request = fetchMock.mock.calls[0][0]
      const url = getFetchUrl(request)
      expect(statusCode).toBe(200)
      expect(json()).toMatchObject([{ routerFeePercentage: expectedFee }])
      expect(url.searchParams.get('slippage')).toBe(expectedSlippage)
      expect(url.searchParams.has('minAmountOut')).toBe(false)
    },
  )
})
