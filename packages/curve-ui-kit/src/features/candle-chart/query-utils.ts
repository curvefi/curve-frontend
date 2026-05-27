import type { UTCTimestamp } from 'lightweight-charts'
import { useCallback, useMemo, useRef } from 'react'
import { toLocalTimestampSeconds } from '@primitives/timestamp.utils'
import { type InfiniteData, type QueryKey, useInfiniteQuery } from '@tanstack/react-query'
import { getOhlcPageStart, getPreviousOhlcPageEnd, hasFullOhlcPage } from './time-utils'
import type { LpPriceOhlcDataFormatted, OraclePriceData, TimeOption } from './types'

export const CANDLE_CHART_QUERY_GC_TIME = 10 * 60 * 1000
export const CANDLE_CHART_QUERY_OPTIONS = {
  staleTime: Infinity,
  gcTime: CANDLE_CHART_QUERY_GC_TIME,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  meta: { persist: false },
} as const

export type OhlcPageParam = {
  start: number
  end: number
}

export type OhlcPageResult = {
  hasMore: boolean
  oldestPageTimestamp?: number
}

type UseOhlcInfiniteQueryParams<TPage extends OhlcPageResult, TQueryKey extends QueryKey> = {
  anchorEnd: number
  enabled?: boolean
  fetchPage: (params: { pageParam: OhlcPageParam; signal: AbortSignal }) => Promise<TPage>
  queryKey: TQueryKey
  timeOption: TimeOption
}

type OhlcPoint = {
  time: number
  open?: number | null
  close?: number | null
  high?: number | null
  low?: number | null
}

type CompleteOhlcPoint = {
  time: number
  open: number
  close: number
  high: number
  low: number
}

type NullableOraclePoint = {
  time: number
  oraclePrice?: number | null
}

type OhlcPaginationQuery = {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isSuccess: boolean
}

type OhlcFetchMoreQuery = OhlcPaginationQuery & {
  fetchNextPage: (options?: { cancelRefetch?: boolean }) => Promise<unknown>
}

type OhlcQuery<TPage> = OhlcFetchMoreQuery & {
  data?: { pages?: TPage[] }
  error: Error | null
  isError: boolean
  isLoading: boolean
  refetch: () => Promise<unknown>
}

type UseOhlcQueryAdapterParams<TPage, TItem> = {
  query: OhlcQuery<TPage>
  selectItems: (page: TPage) => TItem[]
}

type UseOhlcPagesAdapterParams<TPage, TData> = {
  query: OhlcQuery<TPage>
  selectData: (pages: TPage[] | undefined) => TData
}

const canFetchMoreOhlc = ({ hasNextPage, isFetchingNextPage, isSuccess }: OhlcPaginationQuery) =>
  isSuccess && hasNextPage && !isFetchingNextPage

// Historical scrolling can emit repeated fetch attempts before React Query's
// observer state reaches the chart. The chart gates those attempts locally; if
// one still reaches React Query while a page is in flight, keep that request
// alive instead of aborting and restarting it.
const FETCH_NEXT_PAGE_OPTIONS = { cancelRefetch: false } as const

export const useOhlcInfiniteQuery = <TPage extends OhlcPageResult, TQueryKey extends QueryKey>({
  anchorEnd,
  enabled = true,
  fetchPage,
  queryKey,
  timeOption,
}: UseOhlcInfiniteQueryParams<TPage, TQueryKey>) => {
  const fetchPageRef = useRef(fetchPage)
  fetchPageRef.current = fetchPage

  // Callers own the endpoint-specific fetcher and include its identity inputs in queryKey.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return useInfiniteQuery<TPage, Error, InfiniteData<TPage, OhlcPageParam>, TQueryKey, OhlcPageParam>({
    ...CANDLE_CHART_QUERY_OPTIONS,
    queryKey,
    initialPageParam: createOhlcPageParam(timeOption, anchorEnd),
    enabled,
    queryFn: ({ pageParam, signal }) => fetchPageRef.current({ pageParam, signal }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => getNextOhlcPageParam(timeOption, lastPage, lastPageParam),
  })
}

export const getOhlcPaginationState = (query: OhlcPaginationQuery) => ({
  canFetchMore: canFetchMoreOhlc(query),
  isFetchingMore: query.isFetchingNextPage,
})

export const fetchMoreOhlcQueries = (queries: readonly OhlcFetchMoreQuery[]) => {
  const requests = queries.filter(canFetchMoreOhlc).map(query => query.fetchNextPage(FETCH_NEXT_PAGE_OPTIONS))

  return requests.length > 0 ? Promise.all(requests) : undefined
}

export const refetchOhlcQueries = (queries: readonly { refetch: () => Promise<unknown> }[]) =>
  Promise.all(queries.map(query => query.refetch()))

export const useOhlcPagesAdapter = <TPage, TData>({ query, selectData }: UseOhlcPagesAdapterParams<TPage, TData>) => {
  const {
    data: queryData,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    isSuccess,
    refetch: refetchQuery,
  } = query
  const pages = queryData?.pages
  const data = useMemo(() => selectData(pages), [pages, selectData])
  const paginationState = getOhlcPaginationState({ hasNextPage, isFetchingNextPage, isSuccess })

  const refetch = useCallback(() => refetchQuery(), [refetchQuery])

  const fetchMore = useCallback(() => {
    if (!paginationState.canFetchMore) return undefined

    return fetchNextPage(FETCH_NEXT_PAGE_OPTIONS)
  }, [fetchNextPage, paginationState.canFetchMore])

  return {
    data,
    error: isError ? error : null,
    fetchMore,
    isLoading,
    refetch,
    ...paginationState,
  }
}

export const useOhlcQueryAdapter = <TPage, TItem>({ query, selectItems }: UseOhlcQueryAdapterParams<TPage, TItem>) => {
  const selectData = useCallback((pages: TPage[] | undefined) => flattenOhlcPages(pages, selectItems), [selectItems])

  return useOhlcPagesAdapter({ query, selectData })
}

export const createOhlcPageParam = (timeOption: TimeOption, end: number): OhlcPageParam => ({
  start: getOhlcPageStart(timeOption, end),
  end,
})

export const getNextOhlcPageParam = (
  timeOption: TimeOption,
  lastPage: OhlcPageResult,
  lastPageParam: OhlcPageParam,
): OhlcPageParam | undefined => {
  if (!lastPage.hasMore) return undefined

  const oldestPageTimestamp = lastPage.oldestPageTimestamp ?? lastPageParam.start
  const end = getPreviousOhlcPageEnd(timeOption, oldestPageTimestamp)
  return createOhlcPageParam(timeOption, end)
}

export const getOldestOhlcTimestampSeconds = (data: readonly { time: number }[]) =>
  data.length > 0 ? Math.floor(Math.min(...data.map(({ time }) => time)) / 1000) : undefined

export const createOhlcPageResult = (
  data: readonly { time: number }[],
  resultCount: number = data.length,
): OhlcPageResult => ({
  hasMore: hasFullOhlcPage(resultCount),
  oldestPageTimestamp: getOldestOhlcTimestampSeconds(data),
})

export const assertInitialOhlcPageHasData = ({
  anchorEnd,
  dataLength,
  message,
  page,
}: {
  anchorEnd: number
  dataLength: number
  message: string
  page: OhlcPageParam
}) => {
  if (dataLength === 0 && page.end === anchorEnd) {
    throw new Error(message)
  }
}

export const createCandleChartQueryKey = <TParts extends readonly unknown[]>(...parts: TParts) =>
  ['candle-chart', ...parts] as const

export const flattenOhlcPages = <TPage, TItem>(pages: TPage[] | undefined, selectItems: (page: TPage) => TItem[]) =>
  [...(pages ?? [])].reverse().flatMap(selectItems)

export const applyLatestOraclePrice = (data: OraclePriceData[], oraclePrice: number | string | undefined) => {
  if (oraclePrice == null || data.length === 0) return data

  const latestValue = Number(oraclePrice)
  const lastItem = data[data.length - 1]
  if (!Number.isFinite(latestValue) || lastItem.value === latestValue) return data

  return [...data.slice(0, -1), { ...lastItem, value: latestValue }]
}

export const useStableOhlcAnchorEnd = (anchorKey: string) => {
  const anchorRef = useRef<{ key: string; end: number } | null>(null)

  if (anchorRef.current?.key !== anchorKey) {
    anchorRef.current = {
      key: anchorKey,
      end: Math.floor(Date.now() / 1000),
    }
  }

  return anchorRef.current.end
}

const hasCompleteOhlcValues = (data: OhlcPoint): data is CompleteOhlcPoint =>
  data.close != null && data.high != null && data.low != null && data.open != null

export const formatCandleOhlcData = (data: OhlcPoint[]): LpPriceOhlcDataFormatted[] =>
  data.filter(hasCompleteOhlcValues).map(({ time, open, close, high, low }) => ({
    time: toLocalTimestampSeconds(time) as UTCTimestamp,
    open,
    close,
    high,
    low,
  }))

export const formatOraclePriceData = (data: NullableOraclePoint[]): OraclePriceData[] =>
  data.flatMap(({ time, oraclePrice }) =>
    oraclePrice == null
      ? []
      : [
          {
            time: toLocalTimestampSeconds(time) as UTCTimestamp,
            value: oraclePrice,
          },
        ],
  )
