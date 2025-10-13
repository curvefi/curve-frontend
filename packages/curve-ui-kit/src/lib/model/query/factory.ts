import { CB } from 'vest-utils'
import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { logQuery } from '@ui-kit/lib/logging'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model/time'
import { QueryFactoryInput, QueryFactoryOutput } from '@ui-kit/lib/types'
import { checkValidity, FieldName, FieldsOf } from '@ui-kit/lib/validation'

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
      queryFn: ({ queryKey }: QueryFunctionContext<TKey>) => {
        if (!disableLog) logQuery(queryKey)
        return runQuery(getParamsFromQueryKey(queryKey))
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
