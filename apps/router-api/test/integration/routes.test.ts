import type { FastifyInstance } from 'fastify'
import { zeroAddress } from 'viem'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { assert, type PartialRecord } from '@primitives/objects.utils'
import type { RouteProvider, RouterRouteResponse } from '@primitives/router.utils'
import type { CurveJS } from '../../src/curve-router/curvejs'
import { toWei } from '../../src/router.utils'
import { ADDRESS_HEX_PATTERN, type RoutesQuery } from '../../src/routes/routes.schemas'

process.loadEnvFile()

const LIVE_MODE = (import.meta as ImportMeta & { env: { MODE: string } }).env.MODE === 'live'
const ADDRESS_REGEX = new RegExp(ADDRESS_HEX_PATTERN)

const CHAIN_ID_ETHEREUM = '1'
const CHAIN_ID_OPTIMISM = '10'
const ETHEREUM_USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const ETHEREUM_USDT = '0xdac17f958d2ee523a2206206994597c13d831ec7'

const OPTIMISM_USDC = '0x0b2c639c533813f4aa9d7837caf62653d097ff85'
const OPTIMISM_USDT = '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58'

const CHAIN_ID_ARBITRUM = '42161'
const ARBITRUM_USDC = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
const ARBITRUM_USDT = '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'

const CHAIN_ID_PLASMA = '9745'
const CORN_USDT0 = '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb'
const CORN_SUSDE = '0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2'

const USD_DECIMALS = 6
const USDT0_DECIMALS = 6

type QueryString = { [P in keyof RoutesQuery]?: string | string[] }
type SuccessCase = { query: QueryString; expectedRoutes?: number }
type ErrorResponse = { statusCode: number; code: string; error: string; message: string }
type FailureCase = { query: Partial<QueryString>; expectedResponse: ErrorResponse }

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

const jsonResponse = (body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }))

const createCurveMock = (query: QueryString): CurveJS => {
  const tokenIn = first(query.tokenIn)!
  const tokenOut = first(query.tokenOut)!
  const route = [
    {
      poolId: 'mock-pool',
      poolAddress: zeroAddress,
      inputCoinAddress: tokenIn,
      outputCoinAddress: tokenOut,
      swapAddress: zeroAddress,
      swapParams: [0, 1, 1, 1, 1],
    },
  ]

  return {
    getNetworkConstants: () => ({
      DECIMALS: { [tokenIn]: USD_DECIMALS, [tokenOut]: USD_DECIMALS },
    }),
    getPool: () => ({ id: 'mock-pool', name: 'Mock pool', isCrypto: false }),
    router: {
      required: vi.fn().mockResolvedValue('1001'),
      getBestRouteAndOutput: vi.fn().mockResolvedValue({ route, output: '999' }),
      priceImpact: vi.fn().mockResolvedValue(0.01),
      populateSwap: vi.fn().mockResolvedValue({
        data: '0x1234',
        to: zeroAddress,
        from: zeroAddress,
        value: '0',
      }),
    },
  } as unknown as CurveJS
}

const mockProviderResponse = (
  router: RouteProvider,
  query: QueryString,
  curvejs: typeof import('../../src/curve-router/curvejs'),
) => {
  const tokenIn = first(query.tokenIn)!
  const tokenOut = first(query.tokenOut)!
  const amountIn = first(query.amountIn)
  const chainId = Number(first(query.chainId))
  const userAddress = first(query.userAddress)
  const zapAddress = first(query.zapAddress)

  if (router === 'curve') {
    vi.spyOn(curvejs, 'loadCurve').mockResolvedValue(createCurveMock(query))
    return
  }

  const response =
    router === 'enso'
      ? {
          gas: '100000',
          amountOut: '999000000',
          priceImpact: 0.01,
          feeAmount: [],
          minAmountOut: '990000000',
          createdAt: 1,
          tx: { data: '0x1234', to: tokenOut, from: zapAddress, value: '0' },
          route: [
            {
              tokenIn: [tokenIn],
              tokenOut: [tokenOut],
              protocol: 'enso',
              action: 'swap',
              primary: 'enso',
              args: {},
              chainId,
            },
          ],
          ensoFeeAmount: [],
        }
      : router === '0x'
        ? {
            buyAmount: '999000000',
            buyToken: tokenOut,
            sellAmount: amountIn,
            sellToken: tokenIn,
            liquidityAvailable: true,
            minBuyAmount: '990000000',
            totalNetworkFee: '1',
            transaction: { to: tokenOut, data: '0x1234', gas: '100000', gasPrice: '1', value: '0' },
            route: {
              fills: [{ from: tokenIn, to: tokenOut, source: 'Mock liquidity', proportionBps: '10000' }],
              tokens: [],
            },
            fees: { integratorFee: null, zeroExFee: null, gasFee: null },
            issues: { simulationIncomplete: false, invalidSourcesPassed: [] },
            zid: 'mock-quote',
          }
        : {
            expected_out: '999000000',
            gas_estimate: 100000,
            legs: 1,
            ops: 1,
            final_slots: [],
            final_token: tokenOut,
            snapshot_block: 1,
            gas_price_gwei: 1,
            router_address: userAddress,
            calldata: '0x1234',
            debug: {
              routes: [
                {
                  selected: true,
                  coins: [[tokenIn, tokenOut]],
                  pools: ['Mock pool'],
                  pool_addresses: [zeroAddress],
                  swap_addresses: [zeroAddress],
                  swap_params: [[0, 1, 1, 1, 1]],
                },
              ],
            },
          }

  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(() => jsonResponse(response)),
  )
}

/**
 * Success cases per provider. Curve supports amountIn and amountOut; Enso require amountIn.
 */
const successCasesByProvider: PartialRecord<RouteProvider, Record<string, SuccessCase>> = {
  curve: {
    'ethereum amountIn': {
      query: {
        chainId: CHAIN_ID_ETHEREUM,
        tokenIn: [ETHEREUM_USDC],
        tokenOut: [ETHEREUM_USDT],
        amountIn: [toWei('1000000', USD_DECIMALS)],
      },
    },
    'arbitrum amountOut': {
      query: {
        chainId: CHAIN_ID_ARBITRUM,
        tokenIn: [ARBITRUM_USDC],
        tokenOut: [ARBITRUM_USDT],
        amountOut: [toWei('1000', USD_DECIMALS)],
      },
    },
    'plasma amountIn': {
      query: {
        chainId: CHAIN_ID_PLASMA,
        tokenIn: [CORN_USDT0],
        tokenOut: [CORN_SUSDE],
        amountIn: [toWei('10', USDT0_DECIMALS)],
      },
    },
  },
  enso: {
    'ethereum amountIn': {
      query: {
        chainId: CHAIN_ID_ETHEREUM,
        tokenIn: [ETHEREUM_USDT],
        tokenOut: [ETHEREUM_USDC],
        amountIn: [toWei('1000', USD_DECIMALS)],
        router: ['enso'],
        zapAddress: '0xF977814e90dA44bFA03b6295A0616a897441aceC', // binance hot wallet (largest USDT holder on Ethereum now)
      },
    },
    'arbitrum amountIn': {
      query: {
        chainId: CHAIN_ID_ARBITRUM,
        tokenIn: [ARBITRUM_USDC],
        tokenOut: [ARBITRUM_USDT],
        amountIn: [toWei('100', USD_DECIMALS)],
        router: ['enso'],
        zapAddress: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7', // Hyperliquid: Deposit Bridge 2 (largest USDC holder on Arbitrum now)
      },
    },
    'optimism amountIn': {
      query: {
        chainId: CHAIN_ID_OPTIMISM,
        tokenIn: [OPTIMISM_USDC],
        tokenOut: [OPTIMISM_USDT],
        amountIn: [toWei('100', USD_DECIMALS)],
        router: ['enso'],
        zapAddress: '0xBA12222222228d8Ba445958a75a0704d566BF2C8', // Balancer Vault
      },
    },
    'arbitrum amountOut': {
      query: {
        chainId: CHAIN_ID_ARBITRUM,
        tokenIn: [ARBITRUM_USDC],
        tokenOut: [ARBITRUM_USDT],
        amountOut: [toWei('1000', USD_DECIMALS)],
      },
      expectedRoutes: 0, // Enso requires amountIn to return routes
    },
  },
  '0x': {
    'ethereum amountIn': {
      query: {
        chainId: CHAIN_ID_ETHEREUM,
        tokenIn: [ETHEREUM_USDC],
        tokenOut: [ETHEREUM_USDT],
        amountIn: [toWei('1000', USD_DECIMALS)],
        router: ['0x'],
        zapAddress: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
      },
    },
    'optimism amountIn': {
      query: {
        chainId: CHAIN_ID_OPTIMISM,
        tokenIn: [OPTIMISM_USDC],
        tokenOut: [OPTIMISM_USDT],
        amountIn: [toWei('100', USD_DECIMALS)],
        router: ['0x'],
        zapAddress: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      },
    },
    'arbitrum amountIn': {
      query: {
        chainId: CHAIN_ID_ARBITRUM,
        tokenIn: [ARBITRUM_USDC],
        tokenOut: [ARBITRUM_USDT],
        amountIn: [toWei('100', USD_DECIMALS)],
        router: ['0x'],
        zapAddress: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7',
      },
    },
  },
  'curve-solver': {
    'ethereum amountIn': {
      query: {
        chainId: CHAIN_ID_ETHEREUM,
        tokenIn: [ETHEREUM_USDC],
        tokenOut: [ETHEREUM_USDT],
        amountIn: [toWei('1000', USD_DECIMALS)],
        blacklist: [ETHEREUM_USDC],
        router: ['curve-solver'],
        userAddress: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
      },
    },
    'arbitrum amountIn': {
      query: {
        chainId: CHAIN_ID_ARBITRUM,
        tokenIn: [ARBITRUM_USDC],
        tokenOut: [ARBITRUM_USDT],
        amountIn: [toWei('100', USD_DECIMALS)],
        router: ['curve-solver'],
        userAddress: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7',
      },
    },
    'arbitrum amountOut': {
      query: {
        chainId: CHAIN_ID_ARBITRUM,
        tokenIn: [ARBITRUM_USDC],
        tokenOut: [ARBITRUM_USDT],
        amountOut: [toWei('1000', USD_DECIMALS)],
        router: ['curve-solver'],
        userAddress: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7',
      },
      expectedRoutes: 0,
    },
  },
}

const requiredError = (property: string) => "querystring must have required property '" + property + "'"

const failureCases: Record<string, FailureCase> = {
  'missing tokenIn': {
    query: { chainId: CHAIN_ID_ETHEREUM, tokenOut: [ETHEREUM_USDT] },
    expectedResponse: {
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: requiredError('tokenIn'),
    },
  },
  'missing tokenOut': {
    query: { chainId: CHAIN_ID_ETHEREUM, tokenIn: [ETHEREUM_USDC] },
    expectedResponse: {
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: requiredError('tokenOut'),
    },
  },
  'missing token addresses': {
    query: { chainId: CHAIN_ID_ETHEREUM },
    expectedResponse: {
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: requiredError('tokenIn'),
    },
  },
  'invalid tokenIn format': {
    query: { chainId: CHAIN_ID_ETHEREUM, tokenIn: ['not-an-address'], tokenOut: [ETHEREUM_USDT] },
    expectedResponse: {
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: `querystring/tokenIn/0 must match pattern "${ADDRESS_HEX_PATTERN}"`,
    },
  },
  'invalid chainId': {
    query: { chainId: 'not-a-number', tokenIn: [ETHEREUM_USDC], tokenOut: [ETHEREUM_USDT] },
    expectedResponse: {
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: 'querystring/chainId must be integer',
    },
  },
  'too many tokenIn addresses': {
    query: { chainId: CHAIN_ID_ETHEREUM, tokenIn: [ETHEREUM_USDC, ETHEREUM_USDT], tokenOut: [ETHEREUM_USDT] },
    expectedResponse: {
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: 'querystring/tokenIn must NOT have more than 1 items',
    },
  },
}

describe('GET routes integration', () => {
  let server: FastifyInstance
  let curvejs: typeof import('../../src/curve-router/curvejs')

  beforeAll(async () => {
    if (!LIVE_MODE) vi.stubEnv('ZEROEX_API_KEY', 'test-api-key')
    const [{ createRouterApiServer }, curveModule] = await Promise.all([
      import('../../src/server'),
      import('../../src/curve-router/curvejs'),
    ])
    curvejs = curveModule
    server = createRouterApiServer()
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })
  afterAll(async () => {
    vi.unstubAllEnvs()
    await server.close()
  })

  const defineSuccessTests = ({ mocked }: { mocked: boolean }) => {
    const successCases = Object.entries(successCasesByProvider) as [RouteProvider, Record<string, SuccessCase>][]
    successCases.forEach(([router, cases]) => {
      Object.entries(cases).forEach(([label, { query, expectedRoutes = 1 }]) => {
        it(`returns a valid route for ${router} - ${label}`, async () => {
          if (mocked && expectedRoutes) mockProviderResponse(router, query, curvejs)

          const { json, body, statusCode } = await server.inject({
            url: '/api/router/v1/routes',
            query: { ...query, router },
          })
          expect(statusCode, `${router} - ${label} failed with response: ${body}`).toBe(200)

          const payload = json<RouterRouteResponse[]>()
          expect(payload).toHaveLength(expectedRoutes)
          payload.forEach(route => {
            expect(route.router).toBe(router)
            expect(route.amountIn[0]).toMatch(/^[0-9]+\.?[0-9]*$/)
            expect(route.amountOut[0]).toMatch(/^[0-9]+\.?[0-9]*$/)
            expect(route.priceImpact).toBeTypeOf(route.priceImpact == null ? typeof null : 'number')
            expect(route.createdAt).toBeTypeOf('number')
            const steps = assert(route.route, `No route steps for ${router} - ${label}`)
            expect(steps.length).toBeGreaterThan(0)

            steps.forEach(step => {
              if (router.startsWith('curve')) expect(step.protocol).toBe(router)
              expect(step.tokenIn.join(',')).toMatch(ADDRESS_REGEX)
              expect(step.tokenOut.join(',')).toMatch(ADDRESS_REGEX)
            })

            const [expectedTokenIn] = query.tokenIn ?? []
            const [expectedTokenOut] = query.tokenOut ?? []
            const lastStep = steps[steps.length - 1]
            expect(steps[0].tokenIn.join(',').toLowerCase()).toBe(expectedTokenIn.toLowerCase())
            expect(lastStep.tokenOut.join(',').toLowerCase()).toBe(expectedTokenOut.toLowerCase())

            if (route.tx) {
              expect(route.tx.to).toMatch(ADDRESS_REGEX)
              expect(route.tx.from).toMatch(ADDRESS_REGEX)
              expect(route.tx.data).toMatch(/^0x/)
            }
          })
        })
      })
    })
  }

  describe.skipIf(LIVE_MODE)('provider response contracts', () => defineSuccessTests({ mocked: true }))
  describe.runIf(LIVE_MODE)('live provider availability', () => defineSuccessTests({ mocked: false }))

  Object.entries(failureCases).forEach(([label, { query, expectedResponse }]) => {
    it(`returns validation error for ${label}`, async () => {
      const { statusCode, json } = await server.inject({ url: '/api/router/v1/routes', query })
      expect(statusCode).toBe(expectedResponse.statusCode)
      expect(json()).toMatchObject(expectedResponse)
    })
  })
})
