import type { FastifyInstance } from 'fastify'
import { zeroAddress } from 'viem'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import type { RouteProvider } from '@primitives/router.utils'
import { ROUTES_PATH, type RoutesQuery } from '../../src/routes/routes.schemas'

export const CRVUSD = '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E'
export const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
export const ZAP = '0x0000000000000000000000000000000000000001'
export const USER = '0x0000000000000000000000000000000000000002'
export const AMOUNT_IN = '1000000000'

/** Ethereum controllers covering each market assets type, with the router fee they should apply */
export const CONTROLLERS = {
  blueChip: { address: '0x23F5a668A9590130940eF55964ead9787976f2CC', feeBps: '6' }, // WETH-long2
  longTail: { address: '0xFd85e847cDd2549f213E276e4B57B0690169F043', feeBps: '10' }, // svZCHF-crvUSD v2
  correlated: { address: '0x2fb54c8eae57767A9A509A395b9C4FA0702e2675', feeBps: '2' }, // syrupUSDC-crvUSD
} as const

type QueryString = { [P in keyof RoutesQuery]?: string | string[] }

const DEFAULT_QUERY: QueryString = {
  chainId: '1',
  tokenIn: [CRVUSD],
  tokenOut: [WETH],
  amountIn: [AMOUNT_IN],
  userAddress: USER,
  zapAddress: ZAP,
  controllerAddress: CONTROLLERS.blueChip.address,
}

/**
 * Creates the router-api server for the current suite and removes fetch mocks after each test.
 * The server is imported after setting the 0x API key because it is read when the module loads.
 */
export const setupRouterApiServer = () => {
  let server: FastifyInstance
  beforeAll(async () => {
    process.env.ZEROEX_API_KEY = 'test'
    const { createRouterApiServer } = await import('../../src/server')
    server = createRouterApiServer()
  })
  afterEach(() => vi.unstubAllGlobals())
  afterAll(() => server.close())

  return {
    getRoutes: (router: RouteProvider, query: QueryString = {}) =>
      server.inject({ url: ROUTES_PATH, query: { ...DEFAULT_QUERY, router: [router], ...query } }),
  }
}

/** Replaces the global fetch with a mock always returning the given JSON body */
export const mockFetch = (body: unknown, init?: ResponseInit) => {
  const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(Response.json(body, init)))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Returns the query params and headers the router sent to the provider */
export const getProviderRequest = (fetchMock: ReturnType<typeof mockFetch>, call = 0) => {
  const [input, init] = fetchMock.mock.calls[call]
  const url = new URL(input instanceof Request ? input.url : input)
  return { params: Object.fromEntries(url.searchParams), headers: init?.headers }
}

export const ensoRoute = (overrides: Record<string, unknown> = {}) => ({
  gas: '100000',
  amountOut: '990000000',
  priceImpact: 0,
  minAmountOut: '980000000',
  createdAt: 1,
  tx: { data: '0x', to: zeroAddress, from: zeroAddress, value: '0' },
  route: [],
  ...overrides,
})

export const ZEROEX_ALLOWANCE_HOLDER = '0x0000000000001fF3684f28c67538d4D072C22734'

export const zeroExVolumeFee = (amount: string, token: string) => ({
  amount,
  token: token.toLowerCase(),
  type: 'volume',
})

export const zeroExQuote = (overrides: Record<string, unknown> = {}) => ({
  liquidityAvailable: true,
  sellToken: CRVUSD.toLowerCase(),
  buyToken: WETH.toLowerCase(),
  sellAmount: AMOUNT_IN,
  buyAmount: '998500',
  minBuyAmount: '993500',
  totalNetworkFee: '1',
  transaction: { to: ZEROEX_ALLOWANCE_HOLDER, data: '0x1234', gas: '200000', gasPrice: '1', value: '0' },
  route: {
    fills: [{ from: CRVUSD.toLowerCase(), to: WETH.toLowerCase(), source: 'Uniswap_V3', proportionBps: '10000' }],
    tokens: [],
  },
  fees: { integratorFees: null, zeroExFee: null },
  issues: { simulationIncomplete: true, invalidSourcesPassed: [] },
  zid: 'zid',
  ...overrides,
})
