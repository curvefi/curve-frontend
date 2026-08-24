import { afterEach, describe, expect, it, vi } from 'vitest'
import { FetchError, fetchJson } from './fetch.utils'

const jsonResponse = (body: unknown, init?: ResponseInit) => new Response(JSON.stringify(body), init)

const advance = async (ms: number) => {
  await vi.advanceTimersByTimeAsync(ms)
}

describe('fetchJson', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('retries transient GET failures with exponential backoff', async () => {
    vi.useFakeTimers()
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('unavailable', { status: 503 }))
      .mockResolvedValueOnce(new Response('bad gateway', { status: 502 }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetch)

    const request = fetchJson<{ ok: boolean }>('/api/slow')

    expect(fetch).toHaveBeenCalledTimes(1)
    await advance(499)
    expect(fetch).toHaveBeenCalledTimes(1)
    await advance(1)
    expect(fetch).toHaveBeenCalledTimes(2)
    await advance(999)
    expect(fetch).toHaveBeenCalledTimes(2)
    await advance(1)

    await expect(request).resolves.toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('does not retry POST requests by default', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('unavailable', { status: 503 }))
    vi.stubGlobal('fetch', fetch)

    await expect(fetchJson('/api/mutate', { body: { amount: '1' } })).rejects.toMatchObject({ status: 503 })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('does not retry non-transient response statuses', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('not found', { status: 404 }))
    vi.stubGlobal('fetch', fetch)

    await expect(fetchJson('/api/missing')).rejects.toBeInstanceOf(FetchError)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('retries GET requests that exceed the per-attempt timeout', async () => {
    vi.useFakeTimers()
    const fetch = vi
      .fn()
      .mockReturnValueOnce(new Promise(() => undefined))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetch)

    const request = fetchJson<{ ok: boolean }>('/api/slow')

    expect(fetch).toHaveBeenCalledTimes(1)
    await advance(30_000)
    expect(fetch).toHaveBeenCalledTimes(1)
    await advance(499)
    expect(fetch).toHaveBeenCalledTimes(1)
    await advance(1)

    await expect(request).resolves.toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('stops retrying when the signal aborts during backoff', async () => {
    vi.useFakeTimers()
    const controller = new AbortController()
    const fetch = vi.fn().mockResolvedValue(new Response('unavailable', { status: 503 }))
    vi.stubGlobal('fetch', fetch)

    const request = fetchJson('/api/slow', { signal: controller.signal })
    const rejection = expect(request).rejects.toThrow('aborted')

    expect(fetch).toHaveBeenCalledTimes(1)
    controller.abort(new Error('aborted'))
    await advance(500)

    await rejection
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
