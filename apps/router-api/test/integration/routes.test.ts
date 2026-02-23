import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  ADDRESS_HEX_PATTERN,
  type RoutesQuery,
  type RouteProvider,
  type RouteResponse,
} from '../../src/routes/routes.schemas'
import { createRouterApiServer } from '../../src/server'

process.loadEnvFile()

const CHAIN_ID_ETHEREUM = '1'
const ETHEREUM_USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const ETHEREUM_USDT = '0xdac17f958d2ee523a2206206994597c13d831ec7'

const CHAIN_ID_ARBITRUM = '42161'
const ARBITRUM_USDC = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
const ARBITRUM_USDT = '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'

const CHAIN_ID_CORN = '21000000'
const CORN = '0x44f49ff0da2498bcb1d3dc7c0f999578f67fd8c6'
const CORN_WBTCN = '0xda5ddd7270381a7c2717ad10d1c0ecb19e3cdfb2'

type QueryString = { [P in keyof RoutesQuery]?: string | string[] }
type SuccessCase = { query: QueryString; expectedRoutes?: number }
type ErrorResponse = { statusCode: number; code: string; error: string; message: string }
type FailureCase = { query: Partial<QueryString>; expectedResponse: ErrorResponse }

/**
 * Success cases per provider. Curve supports amountIn and amountOut; Enso and Odos require amountIn.
 */
const successCasesByProvider: Record<RouteProvider, Record<string, SuccessCase>> = {
  curve: {
    'ethereum amountIn': {
      query: { chainId: CHAIN_ID_ETHEREUM, tokenIn: [ETHEREUM_USDC], tokenOut: [ETHEREUM_USDT], amountIn: ['1000000'] },
    },
    'arbitrum amountOut': {
      query: { chainId: CHAIN_ID_ARBITRUM, tokenIn: [ARBITRUM_USDC], tokenOut: [ARBITRUM_USDT], amountOut: ['1000'] },
    },
    'corn amountIn': {
      query: { chainId: CHAIN_ID_CORN, tokenIn: [CORN], tokenOut: [CORN_WBTCN], amountIn: ['10'] },
    },
  },
  enso: {
    'ethereum amountIn': {
      query: {
        chainId: CHAIN_ID_ETHEREUM,
        tokenIn: [ETHEREUM_USDT],
        tokenOut: [ETHEREUM_USDC],
        amountIn: ['1000'],
        router: ['enso'],
        userAddress: ['0xF977814e90dA44bFA03b6295A0616a897441aceC'], // binance hot wallet (largest USDT holder on Ethereum now)
      },
    },
    'arbitrum amountIn': {
      query: {
        chainId: CHAIN_ID_ARBITRUM,
        tokenIn: [ARBITRUM_USDC],
        tokenOut: [ARBITRUM_USDT],
        amountIn: ['100'],
        router: ['enso'],
        userAddress: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7', // Hyperliquid: Deposit Bridge 2 (largest USDC holder on Arbitrum now)
      },
    },
    'arbitrum amountOut': {
      query: { chainId: CHAIN_ID_ARBITRUM, tokenIn: [ARBITRUM_USDC], tokenOut: [ARBITRUM_USDT], amountOut: ['1000'] },
      expectedRoutes: 0, // Enso requires amountIn to return routes
    },
  },
  odos: {
    'ethereum amountIn': {
      query: {
        chainId: CHAIN_ID_ETHEREUM,
        tokenIn: [ETHEREUM_USDT],
        tokenOut: [ETHEREUM_USDC],
        amountIn: ['1000'],
        router: ['odos'],
        // Odos requires a caller (leverage zap) and a blacklist address; any valid addresses are acceptable for quoting
        userAddress: '0xC5898606BdB494a994578453B92e7910a90aA873',
        slippage: '0.5',
      },
    },
  },
}

const ADDRESS_REGEX = new RegExp(ADDRESS_HEX_PATTERN)

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

describe.sequential('GET /api/router/v1/routes integration', () => {
  let server: FastifyInstance
  beforeAll(() => (server = createRouterApiServer()))
  afterAll(() => server.close())

  Object.entries(successCasesByProvider).forEach(([router, cases]) => {
    Object.entries(cases).forEach(([label, { query, expectedRoutes = 1 }]) => {
      it(`returns a valid route for ${router} - ${label}`, async () => {
        const { json, statusCode } = await server.inject({
          url: '/api/router/v1/routes',
          query: { ...query, router },
        })
        expect(statusCode).toBe(200)

        const payload = json() as RouteResponse[]
        expect(payload).toHaveLength(expectedRoutes)
        payload.forEach((route) => {
          expect(route.id).toBeTypeOf('string')
          expect(route.id.length).toBeGreaterThan(0)
          expect(route.router).toBe(router)
          expect(route.amountOut).toMatch(/^[0-9]+\.?[0-9]*$/)
          expect(route.priceImpact).toBeTypeOf(route.priceImpact == null ? 'undefined' : 'number')
          expect(route.createdAt).toBeTypeOf('number')
          expect(route.route.length).toBeGreaterThan(0)

          route.route.forEach((step) => {
            if (router === 'curve') {
              expect(step.protocol).toBe('curve')
            }
            expect(step.tokenIn.join(',')).toMatch(ADDRESS_REGEX)
            expect(step.tokenOut.join(',')).toMatch(ADDRESS_REGEX)
          })

          const [expectedTokenIn] = query.tokenIn ?? []
          const [expectedTokenOut] = query.tokenOut ?? []
          const [firstStep] = route.route
          const lastStep = route.route[route.route.length - 1]
          expect(firstStep.tokenIn.join(',')?.toLowerCase()).toBe(expectedTokenIn.toLowerCase())
          expect(lastStep.tokenOut.join(',')?.toLowerCase()).toBe(expectedTokenOut.toLowerCase())
        })
      })
    })
  })

  Object.entries(failureCases).forEach(([label, { query, expectedResponse }]) => {
    it(`returns validation error for ${label}`, async () => {
      const { statusCode, json } = await server.inject({ url: '/api/router/v1/routes', query })
      expect(statusCode).toBe(expectedResponse.statusCode)
      expect(json()).toMatchObject(expectedResponse)
    })
  })
})
