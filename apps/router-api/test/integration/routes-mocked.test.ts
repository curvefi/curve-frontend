import { describe, expect, it } from 'vitest'
import type { ExternalRouteProvider } from '@primitives/router.utils'
import {
  AMOUNT_IN,
  CONTROLLERS,
  CRVUSD,
  ensoRoute,
  getProviderRequest,
  mockFetch,
  USER,
  setupRouterApiServer,
  WETH,
  ZAP,
  ZEROEX_ALLOWANCE_HOLDER,
  zeroExQuote,
  zeroExVolumeFee,
} from './routes.mocks'

/** How each external provider receives the fee and slippage, and how it returns a sell-token fee */
const PROVIDERS: Record<
  ExternalRouteProvider,
  { feeParam: string; slippageParam: string; response: (sellFeeAmount?: string) => unknown }
> = {
  enso: {
    feeParam: 'fee',
    slippageParam: 'slippage',
    response: sellFeeAmount => ensoRoute(sellFeeAmount ? { feeAmount: [sellFeeAmount] } : {}),
  },
  '0x': {
    feeParam: 'swapFeeBps',
    slippageParam: 'slippageBps',
    response: sellFeeAmount =>
      zeroExQuote(
        sellFeeAmount ? { fees: { integratorFees: [zeroExVolumeFee(sellFeeAmount, CRVUSD)], zeroExFee: null } } : {},
      ),
  },
}

const SLIPPAGE_CASES = [
  { slippage: '0.5', enso: '50', '0x': '50' },
  { slippage: '0.015', enso: '1.5', '0x': '2' }, // 0x only accepts integer bps, rounded up
  { slippage: '0', enso: '0', '0x': '0' },
  { slippage: undefined, enso: undefined, '0x': undefined },
]

describe('GET routes mocked unit tests', () => {
  const { getRoutes } = setupRouterApiServer()

  it.each([
    { router: '0x', reason: '0x has no liquidity', response: { liquidityAvailable: false } },
    {
      router: 'curve-solver',
      reason: 'curve-solver finds no route',
      response: { error: 'no routes found' },
      status: 404,
    },
  ] as const)('returns an empty response when $reason', async ({ router, response, ...init }) => {
    mockFetch(response, init)

    const { json, statusCode } = await getRoutes(router)

    expect(statusCode).toBe(200)
    expect(json()).toEqual([])
  })

  describe.each(['enso', '0x'] as const)('%s', router => {
    const { feeParam, slippageParam, response } = PROVIDERS[router]

    it.each(Object.entries(CONTROLLERS))('applies the %s market fee', async (_, { address, feeBps }) => {
      const sellFeeAmount = ((Number(AMOUNT_IN) * Number(feeBps)) / 10_000).toString()
      const fetchMock = mockFetch(response(sellFeeAmount))

      const { json, statusCode } = await getRoutes(router, { controllerAddress: address })

      expect(statusCode).toBe(200)
      expect(json()).toMatchObject([{ router, routerFeePercentage: (Number(feeBps) / 100).toString() }])
      expect(fetchMock).toHaveBeenCalledOnce()
      expect(getProviderRequest(fetchMock).params[feeParam]).toBe(feeBps)
    })

    it.each(SLIPPAGE_CASES)('converts $slippage% slippage', async ({ slippage, ...expected }) => {
      const fetchMock = mockFetch(response())

      const { statusCode } = await getRoutes(router, slippage == null ? {} : { slippage })

      expect(statusCode).toBe(200)
      expect(getProviderRequest(fetchMock).params[slippageParam]).toBe(expected[router])
    })
  })

  describe('enso', () => {
    it('adds the Curve and Enso fees together', async () => {
      mockFetch(ensoRoute({ feeAmount: ['10000000'], ensoFeeAmount: ['5000000'] }))

      const { json } = await getRoutes('enso')

      expect(json()).toMatchObject([{ routerFeePercentage: '1.5' }])
    })

    it('sends slippage instead of minAmountOut', async () => {
      const fetchMock = mockFetch(ensoRoute())

      await getRoutes('enso', { slippage: '0.5' })

      expect(getProviderRequest(fetchMock).params).not.toHaveProperty('minAmountOut')
    })
  })

  describe('0x', () => {
    it('requests an allowance holder quote for the zap', async () => {
      const fetchMock = mockFetch(zeroExQuote())

      await getRoutes('0x', { slippage: '0.5' })

      expect(getProviderRequest(fetchMock)).toEqual({
        params: {
          chainId: '1',
          sellToken: CRVUSD,
          buyToken: WETH,
          sellAmount: AMOUNT_IN,
          taker: ZAP,
          txOrigin: USER,
          slippageBps: '50',
          swapFeeRecipient: '0xB4c2C0B045fA0517cACEebC917443Fa041A9c18B',
          swapFeeBps: CONTROLLERS.blueChip.feeBps,
          swapFeeToken: CRVUSD,
        },
        headers: { '0x-api-key': 'test', '0x-version': 'v2' },
      })
    })

    it('maps the quote to a route', async () => {
      mockFetch(zeroExQuote())

      const { json, statusCode } = await getRoutes('0x')

      expect(statusCode).toBe(200)
      expect(json()).toEqual([
        expect.objectContaining({
          router: '0x',
          routerFeePercentage: '0',
          amountIn: [AMOUNT_IN],
          amountOut: ['998500'],
          gas: '200000',
          tx: { to: ZEROEX_ALLOWANCE_HOLDER, data: '0x1234', from: ZAP, value: '0' },
          route: [
            {
              tokenIn: [CRVUSD.toLowerCase()],
              tokenOut: [WETH.toLowerCase()],
              protocol: '0x',
              action: 'swap',
              chainId: 1,
              args: { source: 'Uniswap_V3', proportionBps: '10000' },
            },
          ],
        }),
      ])
    })

    it('compounds sell and buy token fees', async () => {
      const fees = { integratorFees: [zeroExVolumeFee('600000', CRVUSD)], zeroExFee: zeroExVolumeFee('1500', WETH) }
      mockFetch(zeroExQuote({ buyAmount: '998500', fees }))

      const { json } = await getRoutes('0x')

      // 1 - (1 - 600000 / 1000000000) * (1 - 1500 / (998500 + 1500))
      expect(json()).toMatchObject([{ routerFeePercentage: '0.20991' }])
    })

    it('rejects fees in an unsupported token', async () => {
      mockFetch(zeroExQuote({ fees: { integratorFees: [zeroExVolumeFee('1', USER)], zeroExFee: null } }))

      const { statusCode } = await getRoutes('0x')

      expect(statusCode).toBe(500)
    })
  })
})
