import { zip } from '@primitives/array.utils'
import { fromEntries } from '@primitives/objects.utils'
import {
  type DefaultError,
  hashKey,
  type QueriesOptions,
  type QueriesResults,
  type QueryClient,
  type QueryKey,
  useQueries as useTanstackQueries,
  useQuery as useTanstackQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'
import type { QueryKeyObject } from '@ui/features/queries/factory'

// TanStack requires an array even when there are no queries to observe.
const EMPTY_QUERIES = [] as const

export type QueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TKey extends QueryKey = QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TKey> & { dependencies?: () => readonly QueryKeyObject[] }

/** Observe prerequisites so dependency readiness stays reactive even when options are memoized. */
export function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TKey extends QueryKey = QueryKey,
>({ dependencies, enabled = true, ...options }: QueryOptions<TQueryFnData, TError, TData, TKey>, client?: QueryClient) {
  const ready = useTanstackQueries(
    {
      queries: dependencies?.().map(key => ({ queryKey: [key], enabled: false })) ?? EMPTY_QUERIES,
      combine: results => results.every(({ data }) => data !== undefined),
    },
    client,
  )
  return useTanstackQuery({ ...options, enabled: ready && enabled }, client)
}

/** Observe prerequisites and enable each query independently. */
export function useQueries<T extends unknown[], TCombinedResult = QueriesResults<T>>(
  { queries, ...options }: Parameters<typeof useTanstackQueries<T, TCombinedResult>>[0],
  client?: QueryClient,
) {
  const queryOptions = queries as readonly QueryOptions[]
  const dependencies = queryOptions.map(({ dependencies }) => dependencies?.())
  const keys = dependencies.flatMap(keys => keys ?? EMPTY_QUERIES) // Observe a flat list, but check each query's prerequisites separately.
  const ready = useTanstackQueries(
    {
      queries: keys.map(key => ({ queryKey: [key], enabled: false })),
      combine: results => fromEntries(zip(keys, results).map(([key, q]) => [hashKey([key]), q.data !== undefined])),
    },
    client,
  )
  return useTanstackQueries<T, TCombinedResult>(
    {
      ...options,
      queries: zip(queryOptions, dependencies).map(([{ enabled = true, ...query }, dependencies]) => ({
        ...query,
        enabled: enabled && (dependencies?.every(key => ready[hashKey([key])]) ?? true),
      })) as QueriesOptions<T>,
    },
    client,
  )
}
