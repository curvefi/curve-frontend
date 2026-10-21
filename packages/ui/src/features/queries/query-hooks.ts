import { zip } from '@primitives/array.utils'
import { fromEntries } from '@primitives/objects.utils'
import {
  type DefaultError,
  hashKey,
  type QueriesOptions as TanstackQueriesOptions,
  type QueriesResults,
  type QueryKey,
  useQueries as useTanstackQueries,
  useQuery as useTanstackQuery,
  type UseQueryOptions as TanstackQueryOptions,
} from '@tanstack/react-query'
import type { QueryKeyObject } from '@ui/features/queries/factory'

export type QueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TKey extends QueryKey = QueryKey,
> = TanstackQueryOptions<TQueryFnData, TError, TData, TKey> & { dependencies?: () => readonly QueryKeyObject[] }

type QueriesOptions<T extends unknown[], TCombinedResult = QueriesResults<T>> = Parameters<
  typeof useTanstackQueries<T, TCombinedResult>
>[0]

/** Observe prerequisites so dependency readiness stays reactive even when options are memoized. */
export function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TKey extends QueryKey = QueryKey,
>({ dependencies, enabled = true, ...options }: QueryOptions<TQueryFnData, TError, TData, TKey>) {
  const ready = useTanstackQueries({
    queries: dependencies?.().map(key => ({ queryKey: [key], enabled: false })) ?? [],
    combine: results => results.every(q => q.data !== undefined),
  })
  return useTanstackQuery({ ...options, enabled: ready && enabled })
}

/** Observe prerequisites and enable each query independently. */
export function useQueries<T extends unknown[], TCombinedResult = QueriesResults<T>>({
  queries,
  ...options
}: QueriesOptions<T, TCombinedResult>) {
  const queryOptions = queries as readonly QueryOptions[]
  const dependencies = queryOptions.map(({ dependencies }) => dependencies?.())
  const keys = dependencies.flatMap(keys => keys ?? []) // Observe a flat list, but check each query's prerequisites separately.
  const ready = useTanstackQueries({
    queries: keys.map(key => ({ queryKey: [key], enabled: false })),
    combine: results => fromEntries(zip(keys, results).map(([key, q]) => [hashKey([key]), q.data !== undefined])),
  })
  return useTanstackQueries<T, TCombinedResult>({
    ...options,
    queries: zip(queryOptions, dependencies).map(([{ enabled = true, ...options }, deps]) => ({
      ...options,
      enabled: enabled && (deps?.every(key => ready[hashKey([key])]) ?? true),
    })) as TanstackQueriesOptions<T>,
  })
}
