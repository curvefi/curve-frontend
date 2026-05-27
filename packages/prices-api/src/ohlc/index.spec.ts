import { afterEach, describe, expect, it, vi } from 'vitest'
import { getLpOHLC, getOHLC } from './index'

const completeRow = {
  time: 1_700_000_000,
  open: 1,
  close: 2,
  high: 3,
  low: 0.5,
}

const incompleteRow = {
  time: 1_700_003_600,
  open: null,
  close: 2,
  high: 3,
  low: 0.5,
}

const response = (data = [completeRow, incompleteRow]) =>
  new Response(JSON.stringify({ chain: 'ethereum', address: '0x0000000000000000000000000000000000000001', data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

const mockFetch = () => {
  const fetchMock = vi.fn<typeof fetch>(async () => response())
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const getFetchedUrl = (fetchMock: ReturnType<typeof mockFetch>) => {
  const input = fetchMock.mock.calls[0]?.[0]
  if (!input) {
    throw new Error('Expected fetch to be called')
  }

  return new URL(typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url)
}

describe('ohlc prices-api wrappers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('preserves the legacy 90-day daily getOHLC request shape', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-31T00:00:00.000Z'))
    const fetchMock = mockFetch()

    await getOHLC('ethereum', '0xpool', '0xmain', '0xref', { host: 'https://prices.test' })

    const url = getFetchedUrl(fetchMock)
    expect(url.toString()).toBe(
      'https://prices.test/v1/ohlc/ethereum/0xpool?main_token=0xmain&reference_token=0xref&agg_number=1&agg_units=day&start=1698883200&end=1706659200',
    )
  })

  it('supports parameterized pair OHLC windows and preserves raw result count', async () => {
    const fetchMock = mockFetch()

    const data = await getOHLC(
      {
        chain: 'ethereum',
        poolAddress: '0xpool',
        mainToken: '0xmain',
        referenceToken: '0xref',
        interval: 4,
        units: 'hour',
        start: 1_700_000_000,
        end: 1_700_014_400,
      },
      { host: 'https://prices.test' },
    )

    const url = getFetchedUrl(fetchMock)
    expect(url.pathname).toBe('/v1/ohlc/ethereum/0xpool')
    expect(url.searchParams.get('main_token')).toBe('0xmain')
    expect(url.searchParams.get('reference_token')).toBe('0xref')
    expect(url.searchParams.get('agg_number')).toBe('4')
    expect(url.searchParams.get('agg_units')).toBe('hour')
    expect(url.searchParams.get('start')).toBe('1700000000')
    expect(url.searchParams.get('end')).toBe('1700014400')
    expect(data).toEqual([
      { ...completeRow, time: 1_700_000_000_000 },
      { ...incompleteRow, time: 1_700_003_600_000 },
    ])
  })

  it('supports LP OHLC price units', async () => {
    const fetchMock = mockFetch()

    await getLpOHLC(
      {
        chain: 'ethereum',
        poolAddress: '0xpool',
        priceUnits: 'token0',
        interval: 1,
        units: 'minute',
        start: 1_700_000_000,
        end: 1_700_000_060,
      },
      { host: 'https://prices.test' },
    )

    const url = getFetchedUrl(fetchMock)
    expect(url.pathname).toBe('/v1/lp_ohlc/ethereum/0xpool')
    expect(url.searchParams.get('price_units')).toBe('token0')
    expect(url.searchParams.get('agg_number')).toBe('1')
    expect(url.searchParams.get('agg_units')).toBe('minute')
    expect(url.searchParams.get('start')).toBe('1700000000')
    expect(url.searchParams.get('end')).toBe('1700000060')
  })
})
