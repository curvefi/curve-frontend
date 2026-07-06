import type { FastifyInstance } from 'fastify'
import { zeroAddress } from 'viem'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createRouterApiServer } from '../../src/server'

describe('GET routes mocked unit tests', () => {
  let server: FastifyInstance
  beforeAll(() => (server = createRouterApiServer()))
  afterEach(() => vi.unstubAllGlobals())
  afterAll(() => server.close())

  it.each([
    {
      label: 'preserves upstream 4xx statuses',
      router: ['odos'],
      fetchStatuses: [429],
      expectedStatus: 429,
      expectedBody: 'Upstream response',
    },
    {
      label: 'maps upstream 5xx statuses to 502',
      router: ['odos'],
      fetchStatuses: [503],
      expectedStatus: 502,
      expectedBody: 'Upstream failed with status 503',
    },
    {
      label: 'returns the lowest mapped status when all requested routers fail',
      router: ['odos', 'curve-solver'],
      fetchStatuses: [429, 503],
      expectedStatus: 429,
      expectedBody: 'Upstream response',
    },
  ])('$label', async ({ router, fetchStatuses, expectedStatus, expectedBody }) => {
    vi.stubGlobal(
      'fetch',
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
})
