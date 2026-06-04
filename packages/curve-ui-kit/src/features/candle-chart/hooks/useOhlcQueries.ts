import { useCallback, useMemo, useRef } from 'react'
import { type InfiniteData, type QueryKey, useInfiniteQuery } from '@tanstack/react-query'
import { createOhlcPageParam, getNextOhlcPageParam, type OhlcPageParam, type OhlcPageResult } from '../query-utils'
import type { TimeOption } from '../types'
import { flattenOhlcPages } from '../utils'

type UseOhlcInfiniteQueryParams<TPage extends OhlcPageResult, TQueryKey extends QueryKey> = {
  anchorEnd: number
  enabled?: boolean
  fetchPage: (params: { pageParam: OhlcPageParam; signal: AbortSignal }) => Promise<TPage>
  queryKey: TQueryKey
  timeOption: TimeOption
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

type UseOhlcAdapterParams<TPage, TData> = {
  query: OhlcQuery<TPage>
  data: TData
}

/**
 * Candle chart pages are anchored historical windows. Background refetches can
 * rewrite already-loaded page windows while the user is panning, which can
 * disturb pagination state and viewport restoration.
 *
 * Keep these queries fresh forever and disable mount/focus/reconnect/interval
 * refetches so they fetch only from explicit chart actions: initial load,
 * time/market changes, manual retry, and historical scroll pagination. Also
 * skip persistence because these page windows are cheap to reload and would
 * otherwise bloat the persisted query cache.
 */
const CANDLE_CHART_QUERY_OPTIONS = {
  staleTime: Infinity,
  refetchInterval: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  meta: { persist: false },
} as const

const canFetchMoreOhlc = ({ hasNextPage, isFetchingNextPage, isSuccess }: OhlcPaginationQuery) =>
  isSuccess && hasNextPage && !isFetchingNextPage

/**
 * Protects the historical-scroll race between lightweight-charts events and
 * React Query observer state:
 * 1. The first left-edge scroll event starts `fetchNextPage`.
 * 2. More scroll events can fire before React re-renders with
 *    `isFetchingNextPage: true`.
 * 3. Those duplicate calls can still reach React Query during the active page
 *    request.
 *
 * TanStack Query defaults `cancelRefetch` to true, which would let those
 * duplicate calls cancel/restart the active historical page request. Setting it
 * to false makes duplicate calls during an active page fetch reuse the existing
 * request instead.
 */
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

export const fetchMoreOhlcQueries = (queries: readonly OhlcFetchMoreQuery[]) =>
  Promise.all(queries.filter(canFetchMoreOhlc).map(query => query.fetchNextPage(FETCH_NEXT_PAGE_OPTIONS)))

export const refetchOhlcQueries = (queries: readonly { refetch: () => Promise<unknown> }[]) =>
  Promise.all(queries.map(query => query.refetch()))

const useOhlcAdapter = <TPage, TData>({ query, data }: UseOhlcAdapterParams<TPage, TData>) => {
  const { error, fetchNextPage, hasNextPage, isError, isFetchingNextPage, isLoading, isSuccess, refetch } = query
  const canFetchMore = canFetchMoreOhlc({ hasNextPage, isFetchingNextPage, isSuccess })
  const isFetchingMore = isFetchingNextPage

  const fetchMore = useCallback(
    () => Promise.all(canFetchMore ? [fetchNextPage(FETCH_NEXT_PAGE_OPTIONS)] : []),
    [canFetchMore, fetchNextPage],
  )

  return {
    canFetchMore,
    data,
    error: isError ? error : null,
    fetchMore,
    isFetchingMore,
    isLoading,
    refetch,
  }
}

export const useOhlcPagesAdapter = <TPage, TData>({ query, selectData }: UseOhlcPagesAdapterParams<TPage, TData>) => {
  const pages = query.data?.pages
  const data = useMemo(() => selectData(pages), [pages, selectData])

  return useOhlcAdapter({ query, data })
}

export const useOhlcQueryAdapter = <TPage, TItem>({ query, selectItems }: UseOhlcQueryAdapterParams<TPage, TItem>) =>
  useOhlcPagesAdapter({ query, selectData: pages => flattenOhlcPages(pages, selectItems) })

const createOhlcAnchorEnd = (_resetKey: string) => Math.floor(Date.now() / 1000)

export const useStableOhlcAnchorEnd = (resetKey: string) => useMemo(() => createOhlcAnchorEnd(resetKey), [resetKey])
