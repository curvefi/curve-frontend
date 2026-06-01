import { describe, expect, it, vi } from 'vitest'
import { toLocalTimestampSeconds } from '@primitives/timestamp.utils'
import {
  applyLatestOraclePrice,
  assertInitialOhlcPageHasData,
  createCandleChartQueryKey,
  createOhlcPageResult,
  createOhlcPageParam,
  fetchMoreOhlcQueries,
  flattenOhlcPages,
  formatCandleOhlcData,
  formatOraclePriceData,
  getOldestOhlcTimestampSeconds,
  getNextOhlcPageParam,
  getOhlcPaginationState,
  refetchOhlcQueries,
} from './query-utils'
import type { OraclePriceData } from './types'

describe('candle chart query utils', () => {
  it('creates the initial page from a stable anchor', () => {
    const page = createOhlcPageParam('1d', 1_700_000_000)

    expect(page).toEqual({
      start: 1_674_166_400,
      end: 1_700_000_000,
    })
  })

  it('derives the next historical page from the returned oldest timestamp', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-01-01T00:00:00.000Z'))

    const firstPage = createOhlcPageParam('1h', 1_700_000_000)
    const oldestPageTimestamp = firstPage.start + 1_800
    const nextPage = getNextOhlcPageParam('1h', { hasMore: true, oldestPageTimestamp }, firstPage)

    expect(nextPage).toEqual({
      start: 1_697_845_400,
      end: 1_698_921_800,
    })

    vi.useRealTimers()
  })

  it('keeps loaded page params stable across later refetches', () => {
    const firstPage = createOhlcPageParam('4h', 1_700_000_000)
    const secondPage = getNextOhlcPageParam('4h', { hasMore: true }, firstPage)
    const loadedPageParams = [firstPage, secondPage]

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-01-01T00:00:00.000Z'))

    expect(loadedPageParams).toEqual([firstPage, secondPage])

    vi.useRealTimers()
  })

  it('flattens newest-first infinite pages into oldest-first chart data', () => {
    const pages = [{ data: ['newer-1', 'newer-2'] }, { data: ['older-1', 'older-2'] }]

    expect(flattenOhlcPages(pages, page => page.data)).toEqual(['older-1', 'older-2', 'newer-1', 'newer-2'])
  })

  it('derives pagination state from query state', () => {
    expect(
      getOhlcPaginationState({
        hasNextPage: false,
        isFetchingNextPage: false,
        isSuccess: false,
      }),
    ).toEqual({
      canFetchMore: false,
      isFetchingMore: false,
    })

    expect(
      getOhlcPaginationState({
        hasNextPage: false,
        isFetchingNextPage: false,
        isSuccess: true,
      }),
    ).toEqual({
      canFetchMore: false,
      isFetchingMore: false,
    })
  })

  it('only fetches eligible historical pages', async () => {
    const eligibleFetch = vi.fn(async () => 'eligible')
    const disabledFetch = vi.fn(async () => 'disabled')
    const alreadyFetchingFetch = vi.fn(async () => 'fetching')
    const cappedFetch = vi.fn(async () => 'capped')
    const queries = [
      { hasNextPage: true, isFetchingNextPage: false, isSuccess: true, fetchNextPage: eligibleFetch },
      { hasNextPage: true, isFetchingNextPage: false, isSuccess: false, fetchNextPage: disabledFetch },
      { hasNextPage: true, isFetchingNextPage: true, isSuccess: true, fetchNextPage: alreadyFetchingFetch },
      { hasNextPage: false, isFetchingNextPage: false, isSuccess: true, fetchNextPage: cappedFetch },
    ]

    const result = fetchMoreOhlcQueries(queries)

    await expect(result).resolves.toEqual(['eligible'])
    expect(eligibleFetch).toHaveBeenCalledTimes(1)
    expect(eligibleFetch).toHaveBeenCalledWith({ cancelRefetch: false })
    expect(disabledFetch).not.toHaveBeenCalled()
    expect(alreadyFetchingFetch).not.toHaveBeenCalled()
    expect(cappedFetch).not.toHaveBeenCalled()
  })

  it('returns undefined when no query can fetch more', () => {
    expect(
      fetchMoreOhlcQueries([
        {
          hasNextPage: false,
          isFetchingNextPage: false,
          isSuccess: true,
          fetchNextPage: vi.fn(async () => undefined),
        },
      ]),
    ).toBeUndefined()
  })

  it('returns all refetch requests for callers that need to await retries', async () => {
    const firstRefetch = vi.fn(async () => 'first')
    const secondRefetch = vi.fn(async () => 'second')

    await expect(refetchOhlcQueries([{ refetch: firstRefetch }, { refetch: secondRefetch }])).resolves.toEqual([
      'first',
      'second',
    ])
  })

  it('applies the latest oracle price immutably', () => {
    const data: OraclePriceData[] = [
      { time: 1 as OraclePriceData['time'], value: 1 },
      { time: 2 as OraclePriceData['time'], value: 2 },
    ]

    expect(applyLatestOraclePrice(data, 2)).toBe(data)
    expect(applyLatestOraclePrice(data, 3)).toEqual([
      { time: 1, value: 1 },
      { time: 2, value: 3 },
    ])
    expect(data[1].value).toBe(2)
    expect(applyLatestOraclePrice(data, undefined)).toBe(data)
  })

  it('formats parsed candle OHLC rows', () => {
    expect(formatCandleOhlcData([{ time: 1_700_000_000_000, open: 1, high: 2, low: 0.5, close: 1.5 }])).toEqual([
      { time: toLocalTimestampSeconds(1_700_000_000_000), open: 1, high: 2, low: 0.5, close: 1.5 },
    ])
  })

  it('derives the oldest page timestamp from parsed API timestamps', () => {
    expect(getOldestOhlcTimestampSeconds([{ time: 1_700_000_000_000 }, { time: 1_699_996_400_000 }])).toBe(
      1_699_996_400,
    )
    expect(getOldestOhlcTimestampSeconds([])).toBeUndefined()
  })

  it('creates page metadata from parsed API timestamps', () => {
    expect(createOhlcPageResult([{ time: 1_700_000_000_000 }], 300)).toEqual({
      hasMore: true,
      oldestPageTimestamp: 1_700_000_000,
    })
  })

  it('throws a contextual error only for empty initial pages', () => {
    expect(() =>
      assertInitialOhlcPageHasData({
        anchorEnd: 2,
        dataLength: 0,
        message: 'No data',
        page: { start: 1, end: 2 },
      }),
    ).toThrow('No data')

    expect(() =>
      assertInitialOhlcPageHasData({
        anchorEnd: 2,
        dataLength: 0,
        message: 'No data',
        page: { start: 0, end: 1 },
      }),
    ).not.toThrow()
  })

  it('creates a shared candle-chart query key prefix', () => {
    expect(createCandleChartQueryKey('dex', { chain: 'ethereum' })).toEqual([
      'candle-chart',
      'dex',
      { chain: 'ethereum' },
    ])
  })

  it('formats oracle rows and filters missing values', () => {
    const timestamp = 1_700_000_000_000

    expect(
      formatOraclePriceData([
        { time: timestamp, oraclePrice: 1.2 },
        { time: timestamp + 1, oraclePrice: null },
      ]),
    ).toEqual([{ time: toLocalTimestampSeconds(timestamp), value: 1.2 }])
  })

  it('formats candle rows and filters incomplete OHLC values after pagination metadata is derived', () => {
    expect(
      formatCandleOhlcData([
        { time: 1_700_000_000_000, open: 1, high: 2, low: 0.5, close: 1.5 },
        { time: 1_700_003_600_000, open: null, high: 2, low: 0.5, close: 1.5 },
      ]),
    ).toEqual([{ time: toLocalTimestampSeconds(1_700_000_000_000), open: 1, high: 2, low: 0.5, close: 1.5 }])
  })

  it('formats empty data without errors', () => {
    expect(formatCandleOhlcData([])).toEqual([])
    expect(formatOraclePriceData([])).toEqual([])
  })
})
