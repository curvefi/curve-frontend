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
>(
  { dependencies = () => [], enabled = true, ...options }: QueryOptions<TQueryFnData, TError, TData, TKey>,
  client?: QueryClient,
) {
  const ready = useTanstackQueries(
    {
      queries: dependencies().map(key => ({ queryKey: [key], enabled: false })),
      combine: results => results.every(({ data }) => data !== undefined),
      subscribed: options.subscribed,
    },
    client,
  )
  return useTanstackQuery({ ...options, enabled: ready && enabled }, client)
}

/** Observe prerequisites and enable each query independently. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Match TanStack's heterogeneous query tuple constraint.
export function useQueries<T extends any[], TCombinedResult = QueriesResults<T>>(
  {
    queries,
    ...options
  }: {
    queries:
      | readonly [...QueriesOptions<T>]
      | readonly [...{ [K in keyof T]: QueriesOptions<[T[K]]>[0] & Pick<QueryOptions, 'dependencies'> }]
    combine?: (results: QueriesResults<T>) => TCombinedResult
    subscribed?: boolean
  },
  client?: QueryClient,
) {
  const queryOptions = queries as readonly QueryOptions[]
  const dependencies = queryOptions.map(({ dependencies = () => [] }) => dependencies())
  const keys = dependencies.flat()
  const ready = useTanstackQueries(
    {
      queries: keys.map(key => ({ queryKey: [key], enabled: false })),
      combine: results => Object.fromEntries(results.map(({ data }, i) => [hashKey([keys[i]]), data !== undefined])),
      subscribed: options.subscribed,
    },
    client,
  )
  return useTanstackQueries<T, TCombinedResult>(
    {
      ...options,
      queries: queryOptions.map((query, i) => ({
        ...query,
        enabled: dependencies[i].every(key => ready[hashKey([key])]) && (query.enabled ?? true),
      })) as QueriesOptions<T>,
    },
    client,
  )
}
