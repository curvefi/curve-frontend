import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const defiLlamaPools = {
  data: [
    {
      chain: 'Ethereum',
      project: 'uniswap-v3',
      poolMeta: '0.01%',
      tvlUsd: 100,
      volumeUsd7d: 700,
      underlyingTokens: [USDC, USDT],
    },
    {
      chain: 'Ethereum',
      project: 'uniswap-v3',
      poolMeta: '0.05%',
      tvlUsd: 50,
      volumeUsd7d: null,
      underlyingTokens: [USDC, USDT],
    },
    {
      chain: 'Base',
      project: 'uniswap-v3',
      poolMeta: '0.3%',
      tvlUsd: 1,
      volumeUsd7d: 1,
      underlyingTokens: [USDC, USDT],
    },
    { chain: 'Ethereum', project: 'curve-dex', poolMeta: null, tvlUsd: 1, underlyingTokens: [USDC, USDT] },
  ],
}

describe('GET uniswap-v3-pools mocked unit tests', () => {
  let server: FastifyInstance
  const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(Response.json(defiLlamaPools)))
  beforeAll(async () => {
    vi.stubGlobal('fetch', fetchMock)
    const { createRouterApiServer } = await import('../../src/server')
    server = createRouterApiServer()
  })
  afterAll(async () => {
    vi.unstubAllGlobals()
    await server.close()
  })

  it('keys the chain pools by lowercase tokens and fee tier, and caches DefiLlama', async () => {
    const first = await server.inject({ url: '/api/router/v1/uniswap-v3-pools', query: { chainId: '1' } })
    const second = await server.inject({ url: '/api/router/v1/uniswap-v3-pools', query: { chainId: '8453' } })

    expect(first.statusCode).toBe(200)
    expect(first.json()).toEqual({
      [`${USDC.toLowerCase()}-${USDT.toLowerCase()}-100`]: { tvlUsd: 100, volumeUsd7d: 700 },
      [`${USDC.toLowerCase()}-${USDT.toLowerCase()}-500`]: { tvlUsd: 50, volumeUsd7d: null },
    })
    expect(Object.keys(second.json())).toEqual([`${USDC.toLowerCase()}-${USDT.toLowerCase()}-3000`])
    expect(fetchMock).toHaveBeenCalledOnce()
  })
})
