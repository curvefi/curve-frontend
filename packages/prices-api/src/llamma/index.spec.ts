import { afterEach, describe, expect, it, vi } from 'vitest'
import { getOHLC } from './index'

const llamma = '0x0000000000000000000000000000000000000001'

const ohlcResponse = () =>
  new Response(
    JSON.stringify({
      data: [
        {
          time: 1_700_000_000,
          open: 1,
          close: 1,
          high: 1,
          low: 1,
          base_price: 1,
          oracle_price: 1,
          volume: 1,
        },
      ],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )

describe('llamma prices-api wrappers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('forwards AbortSignal to getOHLC requests', async () => {
    const signal = new AbortController().signal
    const fetchMock = vi.fn<typeof fetch>(async () => ohlcResponse())
    vi.stubGlobal('fetch', fetchMock)

    await getOHLC(
      {
        endpoint: 'crvusd',
        chain: 'ethereum',
        llamma,
        interval: 1,
        start: 1_700_000_000,
        end: 1_700_003_600,
      },
      { host: 'https://prices.test', signal },
    )

    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBe(signal)
  })
})
