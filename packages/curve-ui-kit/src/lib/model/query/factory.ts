import type { Suite } from 'vest'
import { CB } from 'vest-utils'
import {
  QueryFunctionContext,
  queryOptions,
  useQuery,
  type DefaultError,
  type FetchQueryOptions,
  type QueryKey,
  type QueryObserverOptions,
} from '@tanstack/react-query'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { logQuery } from '@ui-kit/lib/logging'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model/time'
import { checkValidity, FieldName, FieldsOf } from '@ui-kit/lib/validation'

// Checks if T is a union type (e.g., 'a' | 'b')
type IsUnion<T, U = T> = T extends T ? ([U] extends [T] ? false : true) : never

// Checks if T is a string literal (not just `string`)
type IsStringLiteral<T> = T extends string ? (string extends T ? false : true) : false

// Checks if T is an object with exactly one key
type IsSingleKeyObject<T> = T extends object
  ? keyof T extends never
    ? false // empty object
    : IsUnion<keyof T> extends false
      ? true // single key
      : false // multiple keys (union)
  : false

// Checks if T is a string literal or an object with one property
type IsLiteralOrSingleKeyObject<T> = IsStringLiteral<T> extends true ? true : IsSingleKeyObject<T>

// Recursively checks each element in the tuple
type AreAllElementsLiteralOrSinglePropertyObject<T extends readonly unknown[]> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? IsLiteralOrSingleKeyObject<First> extends true
    ? AreAllElementsLiteralOrSinglePropertyObject<Rest>
    : false
  : true

// Combined type that ensures T is a tuple and all elements pass the checks
type QueryKeyTuple<T extends readonly unknown[]> = T extends readonly [...infer Elements]
  ? number extends Elements['length']
    ? never // Not a tuple
    : AreAllElementsLiteralOrSinglePropertyObject<T> extends true
      ? T // Valid tuple
      : never // Elements fail the check
  : never // Not an array

/**
 * Reconstructs params from a query key tuple by merging all object entries.
 *
 * This pattern ensures we can recover named parameters from the query key for validation.
 * Query keys must contain only string literals (ignored) or **single-key objects** (parsed).
 *
 * @example
 * getParamsFromQueryKey(['pool', { chainId: 1 }, { poolId: 'abc' }])
 * // → { chainId: 1, poolId: 'abc' }
 */
const getParamsFromQueryKey = <TKey extends readonly unknown[], TParams>(queryKey: TKey) =>
  Object.fromEntries(queryKey.flatMap((i) => (i && typeof i === 'object' ? Object.entries(i) : []))) as TParams

export function queryFactory<
  TQuery extends object,
  const TKey extends readonly unknown[],
  TData,
  TParams extends FieldsOf<TQuery> = FieldsOf<TQuery>,
  TField extends string = FieldName<TQuery>,
  TCallback extends CB = CB<TQuery, TField[]>,
>({
  queryFn: runQuery,
  queryKey,
  staleTime = '5m',
  gcTime = '10m',
  refetchInterval,
  validationSuite,
  dependencies,
  disableLog,
  ...options
}: {
  queryKey: (params: TParams) => QueryKeyTuple<TKey>
  validationSuite: Suite<TField, string, TCallback>
  queryFn: (params: TQuery) => Promise<TData>
  gcTime?: keyof typeof REFRESH_INTERVAL
  staleTime?: keyof typeof REFRESH_INTERVAL
  dependencies?: (params: TParams) => QueryKey[]
  retry?: QueryObserverOptions<unknown, DefaultError>['retry'] // type is not exported by Tanstack
  refetchInterval?: keyof typeof REFRESH_INTERVAL
  refetchOnWindowFocus?: 'always'
  refetchOnMount?: 'always'
  disableLog?: true
}) {
  const getQueryOptions = (params: TParams, enabled = true) =>
    queryOptions({
      queryKey: queryKey(params),
      queryFn: async ({ queryKey }: QueryFunctionContext<TKey>) => {
        try {
          if (!disableLog) logQuery(queryKey)
          return await runQuery(getParamsFromQueryKey(queryKey))
        } catch (error) {
          console.error(`Error in query `, JSON.stringify(queryKey), error) // log here, `queryClient.onError` has no stack trace
          throw error
        }
      },
      gcTime: REFRESH_INTERVAL[gcTime],
      staleTime: REFRESH_INTERVAL[staleTime],
      refetchInterval: refetchInterval && REFRESH_INTERVAL[refetchInterval],
      enabled:
        enabled &&
        checkValidity(validationSuite, params) &&
        !dependencies?.(params).some((key) => !queryClient.getQueryData(key)),
      ...options,
    })
  return {
    queryKey,
    getQueryOptions,
    getQueryData: (params: TParams): TData | undefined => queryClient.getQueryData(queryKey(params)),
    setQueryData: (params: TParams, data: TData) => queryClient.setQueryData<TData>(queryKey(params), data),
    prefetchQuery: (params: TParams, staleTime = 0) =>
      queryClient.prefetchQuery({ ...getQueryOptions(params), staleTime }),
    fetchQuery: (params: TParams, options?: Partial<FetchQueryOptions<TData, DefaultError, TData, TKey>>) =>
      queryClient.fetchQuery({ ...getQueryOptions(params), ...options }),
    /**
     * Function that is like fetchQuery, but sets staleTime to 0 to ensure fresh data is fetched.
     * Primary use case is for Zustand stores where want to both use queries and ensure freshness.
     * I suspect this will be the only case, and once Zustand refactoring to Tanstack is complete, we may delete this.
     */
    refetchQuery: (params: TParams) => queryClient.fetchQuery({ ...getQueryOptions(params), ...options, staleTime: 0 }),
    useQuery: (params: TParams, condition?: boolean) => useQuery(getQueryOptions(params, condition)),
    invalidate: (params: TParams) => queryClient.invalidateQueries({ queryKey: queryKey(params) }),
  } as const
}
