import type { FastifyInstance } from 'fastify'
import { zeroAddress } from 'viem'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const USDT = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const CURVE_LP = '0x4f493b7de8aac7d55f71853688b1f7c8f0243c85'
const POSITION_MANAGER = '0xc36442b4a4522e871399cd717abdd847ab11fe88'

const query = {
  chainId: '1',
  protocol: 'uniswap-v3',
  positionManager: POSITION_MANAGER,
  tokenId: '1',
  liquidity: '1000',
  tokens: [USDC, USDT],
  tokenOut: CURVE_LP,
  userAddress: zeroAddress,
  slippage: '0.5',
}

const ensoBundleResponse = {
  amountsOut: { [CURVE_LP]: '990' },
  minAmountsOut: { [CURVE_LP]: '985' },
  gas: '800000',
  tx: { data: '0x', to: zeroAddress, from: zeroAddress, value: '0' },
  preTransactions: [{ type: 'tokenApproval', tx: { to: POSITION_MANAGER, data: '0x095ea7b3' } }],
}

describe('GET clmm-migration mocked unit tests', () => {
  let server: FastifyInstance
  beforeAll(async () => {
    const { createRouterApiServer } = await import('../../src/server')
    server = createRouterApiServer()
  })
  afterEach(() => vi.unstubAllGlobals())
  afterAll(() => server.close())

  it('redeems, takes the flat fee from both tokens and routes them into the Curve LP', async () => {
    const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(Response.json(ensoBundleResponse)))
    vi.stubGlobal('fetch', fetchMock)

    const { json, statusCode } = await server.inject({ url: '/api/router/v1/clmm-migration', query })

    expect(statusCode).toBe(200)
    expect(json()).toMatchObject({
      routerFeePercentage: '0.02',
      amountOut: '990',
      minAmountOut: '985',
      approval: { to: POSITION_MANAGER, data: '0x095ea7b3' },
    })
    const [, init] = fetchMock.mock.calls[0]
    const actions = JSON.parse(init!.body as string) as {
      protocol: string
      action: string
      args: Record<string, unknown>
    }[]
    expect(actions.map(({ protocol, action }) => `${protocol}:${action}`)).toEqual([
      'uniswap-v3:redeemclmm',
      'enso:fee',
      'enso:fee',
      'enso:route',
      'enso:route',
    ])
    expect(actions[1].args).toMatchObject({ token: USDC, bps: '2', amount: { useOutputOfCallAt: 0, index: 0 } })
    expect(actions[4].args).toMatchObject({
      tokenIn: USDT,
      tokenOut: CURVE_LP,
      amountIn: { useOutputOfCallAt: 2 },
      slippage: '50',
    })
  })

  it('skips the fee on chains without a fee receiver', async () => {
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(Response.json({ ...ensoBundleResponse, preTransactions: [] })),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { json, statusCode } = await server.inject({
      url: '/api/router/v1/clmm-migration',
      query: { ...query, chainId: '42161' },
    })

    expect(statusCode).toBe(200)
    expect(json()).toMatchObject({ routerFeePercentage: '0', approval: null })
    const actions = JSON.parse(fetchMock.mock.calls[0][1]!.body as string) as { action: string }[]
    expect(actions.map(({ action }) => action)).toEqual(['redeemclmm', 'route', 'route'])
  })

  it('leaves zero-amount tokens out of the fee and route actions', async () => {
    const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(Response.json(ensoBundleResponse)))
    vi.stubGlobal('fetch', fetchMock)

    const { statusCode } = await server.inject({
      url: '/api/router/v1/clmm-migration',
      query: { ...query, skipTokens: [USDC] },
    })

    expect(statusCode).toBe(200)
    const actions = JSON.parse(fetchMock.mock.calls[0][1]!.body as string) as {
      action: string
      args: Record<string, unknown>
    }[]
    expect(actions.map(({ action }) => action)).toEqual(['redeemclmm', 'fee', 'route'])
    expect(actions[1].args).toMatchObject({ token: USDT, amount: { useOutputOfCallAt: 0, index: 1 } })
    expect(actions[2].args).toMatchObject({ tokenIn: USDT, amountIn: { useOutputOfCallAt: 1 } })
  })
})
