import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMerklServer } from '../src/server'

const MERKL_API_URL = 'https://api.merkl.xyz'

const jsonResponse = (payload: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  })

const getFetchCall = (fetchMock: ReturnType<typeof vi.fn<typeof fetch>>) => {
  expect(fetchMock).toHaveBeenCalled()
  return fetchMock.mock.calls[0]
}

const getFetchInit = (fetchMock: ReturnType<typeof vi.fn<typeof fetch>>) => {
  const [, init] = getFetchCall(fetchMock)
  expect(init).toBeDefined()
  return init!
}

const createServer = (MERKL_API_KEY = 'test-merkl-key') =>
  createMerklServer({ NODE_ENV: 'test', LOG_LEVEL: 'silent', MERKL_API_KEY })

describe('GET opportunities', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('forwards query params to the Merkl opportunities endpoint', async () => {
    const upstreamPayload = [{ identifier: 'curve-pool' }]
    const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(jsonResponse(upstreamPayload)))
    vi.stubGlobal('fetch', fetchMock)
    const server = createServer()

    try {
      const { statusCode, json } = await server.inject({
        url: '/api/merkl/v1/opportunities',
        query: {
          mainProtocolId: 'curve',
          test: 'false',
          status: 'LIVE',
          action: 'POOL',
          items: '100',
          page: '0',
        },
      })

      expect(statusCode).toBe(200)
      expect(json()).toEqual(upstreamPayload)

      const [input] = getFetchCall(fetchMock)
      const url = new URL(typeof input === 'string' || input instanceof URL ? input.toString() : input.url)
      expect(`${url.origin}${url.pathname}`).toBe(`${MERKL_API_URL}/v4/opportunities`)
      expect(Object.fromEntries(url.searchParams)).toEqual({
        mainProtocolId: 'curve',
        test: 'false',
        status: 'LIVE',
        action: 'POOL',
        items: '100',
        page: '0',
      })
    } finally {
      await server.close()
    }
  })

  it('passes the configured Merkl API key as X-API-Key', async () => {
    const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(jsonResponse([])))
    vi.stubGlobal('fetch', fetchMock)
    const server = createServer('secret-merkl-key')

    try {
      const { statusCode } = await server.inject({ url: '/api/merkl/v1/opportunities' })
      expect(statusCode).toBe(200)

      const init = getFetchInit(fetchMock)
      expect(init.headers).toMatchObject({ 'X-API-Key': 'secret-merkl-key' })
    } finally {
      await server.close()
    }
  })

  it('requires a Merkl API key', () => {
    expect(() => createMerklServer({ NODE_ENV: 'test', LOG_LEVEL: 'silent' })).toThrow(
      'Missing required environment variable MERKL_API_KEY',
    )
  })

  it('rejects unsupported main protocol IDs', async () => {
    const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(jsonResponse([])))
    vi.stubGlobal('fetch', fetchMock)
    const server = createServer()

    try {
      const { statusCode, json } = await server.inject({
        url: '/api/merkl/v1/opportunities',
        query: { mainProtocolId: 'other-protocol', status: 'LIVE' },
      })

      expect(statusCode).toBe(400)
      expect(json()).toMatchObject({
        code: 'FST_ERR_VALIDATION',
        message: 'querystring/mainProtocolId must be equal to one of the allowed values',
      })
      expect(fetchMock).not.toHaveBeenCalled()
    } finally {
      await server.close()
    }
  })

  it('rejects unsupported campaign statuses', async () => {
    const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(jsonResponse([])))
    vi.stubGlobal('fetch', fetchMock)
    const server = createServer()

    try {
      const { statusCode, json } = await server.inject({
        url: '/api/merkl/v1/opportunities',
        query: { mainProtocolId: 'curve', status: 'PAST' },
      })

      expect(statusCode).toBe(400)
      expect(json()).toMatchObject({
        code: 'FST_ERR_VALIDATION',
        message: 'querystring/status must be equal to one of the allowed values',
      })
      expect(fetchMock).not.toHaveBeenCalled()
    } finally {
      await server.close()
    }
  })

  it('returns upstream failures without leaking secrets or upstream bodies', async () => {
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response('upstream secret body', { status: 429, statusText: 'Too Many Requests' })),
    )
    vi.stubGlobal('fetch', fetchMock)
    const server = createServer('secret-merkl-key')

    try {
      const response = await server.inject({ url: '/api/merkl/v1/opportunities' })
      expect(response.statusCode).toBe(429)

      const body = response.body
      expect(body).toContain('Merkl opportunities request failed with status 429')
      expect(body).not.toContain('secret-merkl-key')
      expect(body).not.toContain('upstream secret body')
    } finally {
      await server.close()
    }
  })
})
