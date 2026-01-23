import type { IsStringLiteral, SingleKeyObject } from 'type-fest'
import type { Suite } from 'vest'
import { CB } from 'vest-utils'
import {
  QueryFunctionContext,
  queryOptions,
  useQuery,
  type DefaultError,
  type FetchQueryOptions,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { logQuery } from '@ui-kit/lib/logging'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model/time'
import { checkValidity, FieldName, FieldsOf } from '@ui-kit/lib/validation'

// Checks if T is a string literal or an object with one property
type IsLiteralOrSingleKeyObject<T> =
  IsStringLiteral<T> extends true ? true : T extends SingleKeyObject<T> ? true : false

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

type QueryFactoryInput<
  TValidParams extends object,
  TKey extends readonly unknown[],
  TData,
  TParams extends FieldsOf<TValidParams> = FieldsOf<TValidParams>,
  TField extends string = FieldName<TValidParams>,
  TGroup extends string = string,
  TCallback extends CB = CB<TValidParams, TField[]>,
> = {
  queryKey: (params: TParams) => QueryKeyTuple<TKey>
  validationSuite: Suite<TField, TGroup, TCallback>
  queryFn: (params: TValidParams) => Promise<TData>
  gcTime?: keyof typeof REFRESH_INTERVAL
  staleTime?: keyof typeof REFRESH_INTERVAL
  refetchInterval?: keyof typeof REFRESH_INTERVAL
  dependencies?: (params: TParams) => QueryKey[]
  refetchOnWindowFocus?: 'always'
  refetchOnMount?: 'always'
  disableLog?: true
}

type QueryFactoryOutput<
  TValidParams extends object,
  TKey extends readonly unknown[],
  TData,
  TParams extends FieldsOf<TValidParams> = FieldsOf<TValidParams>,
  TError = DefaultError,
> = {
  getQueryOptions: (params: TParams, enabled?: boolean) => UseQueryOptions<TData, TError, TData, TKey>
  queryKey: (params: TParams) => QueryKeyTuple<TKey>
  useQuery: (params: TParams, enabled?: boolean) => UseQueryResult<TData, TError>
  getQueryData: (params: TParams) => TData | undefined
  setQueryData: (params: TParams, data: TData) => void
  prefetchQuery: (params: TParams, staleTime?: number) => Promise<void>
  fetchQuery: (params: TParams, options?: Partial<FetchQueryOptions<TData, TError, TData, TKey>>) => Promise<TData>
  refetchQuery: (params: TParams) => Promise<TData>
  invalidate: (params: TParams) => void // todo: should be Promise<void>
}

const getParamsFromQueryKey = <TKey extends readonly unknown[], TParams>(queryKey: TKey) =>
  Object.fromEntries(queryKey.flatMap((i) => (i && typeof i === 'object' ? Object.entries(i) : []))) as TParams

export function queryFactory<
  TQuery extends object,
  TKey extends readonly unknown[],
  TData,
  TParams extends FieldsOf<TQuery> = FieldsOf<TQuery>,
  TField extends FieldName<TQuery> = FieldName<TQuery>,
  TGroup extends string = string,
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
}: QueryFactoryInput<TQuery, TKey, TData, TParams, TField, TGroup, TCallback>): QueryFactoryOutput<
  TQuery,
  TKey,
  TData,
  TParams
> {
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
    getQueryData: (params) => queryClient.getQueryData(queryKey(params)),
    setQueryData: (params, data) => queryClient.setQueryData<TData>(queryKey(params), data),
    prefetchQuery: (params, staleTime = 0) => queryClient.prefetchQuery({ ...getQueryOptions(params), staleTime }),
    fetchQuery: (params, options) => queryClient.fetchQuery({ ...getQueryOptions(params), ...options }),
    /**
     * Function that is like fetchQuery, but sets staleTime to 0 to ensure fresh data is fetched.
     * Primary use case is for Zustand stores where want to both use queries and ensure freshness.
     * I suspect this will be the only case, and once Zustand refactoring to Tanstack is complete, we may delete this.
     */
    refetchQuery: (params) => queryClient.fetchQuery({ ...getQueryOptions(params), ...options, staleTime: 0 }),
    useQuery: (params, condition) => useQuery(getQueryOptions(params, condition)),
    invalidate: (params) => queryClient.invalidateQueries({ queryKey: queryKey(params) }),
  }
}
