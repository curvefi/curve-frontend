import { afterEach, describe, expect, it, vi } from 'vitest'
import { getOracle } from './index'

const controller = '0x0000000000000000000000000000000000000001'

const oracleResponse = () =>
  new Response(
    JSON.stringify({
      chain: 'ethereum',
      controller,
      oracle: '0x0000000000000000000000000000000000000002',
      price_source_pools: [
        {
          address: '0x0000000000000000000000000000000000000003',
          borrowed_ix: 0,
          borrowed_symbol: 'crvUSD',
          borrowed_address: '0x0000000000000000000000000000000000000004',
          collateral_ix: 1,
          collateral_symbol: 'ETH',
          collateral_address: '0x0000000000000000000000000000000000000005',
        },
      ],
      data: [
        {
          time: 1_700_000_000,
          open: 1,
          close: 1,
          high: 1,
          low: 1,
          base_price: 1,
          oracle_price: 1,
        },
      ],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )

describe('lending prices-api wrappers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('forwards AbortSignal to getOracle requests', async () => {
    const signal = new AbortController().signal
    const fetchMock = vi.fn<typeof fetch>(async () => oracleResponse())
    vi.stubGlobal('fetch', fetchMock)

    await getOracle(
      {
        endpoint: 'lending',
        chain: 'ethereum',
        controller,
        interval: 1,
        start: 1_700_000_000,
        end: 1_700_003_600,
      },
      { host: 'https://prices.test', signal },
    )

    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBe(signal)
  })
})
