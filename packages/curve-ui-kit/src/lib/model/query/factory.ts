import { CB } from 'vest-utils'
import type { UseQueryOptions } from '@tanstack/react-query'
import { QueryFunctionContext, QueryKey, queryOptions, useQuery } from '@tanstack/react-query'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { logQuery } from '@ui-kit/lib/logging'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model/time'
import { QueryFactoryInput, QueryFactoryOutput } from '@ui-kit/lib/types'
import { assertValidity as sharedAssertValidity, checkValidity, FieldName, FieldsOf } from '@ui-kit/lib/validation'

export const getParamsFromQueryKey = <TKey extends readonly unknown[], TParams, TQuery, TField>(queryKey: TKey) =>
  Object.fromEntries(queryKey.flatMap((i) => (i && typeof i === 'object' ? Object.entries(i) : []))) as TParams

export const createQueryHook =
  <TParams, TData, TQueryKey extends QueryKey>(
    getQueryOptions: (params: TParams, condition?: boolean) => UseQueryOptions<TData, Error, TData, TQueryKey>,
  ) =>
  (params: TParams, condition?: boolean) =>
    useQuery<TData, Error, TData, TQueryKey>(getQueryOptions(params, condition))

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
  staleTime,
  gcTime,
  refetchInterval,
  validationSuite,
  dependencies,
  refetchOnWindowFocus,
  refetchOnMount,
}: QueryFactoryInput<TQuery, TKey, TData, TParams, TField, TGroup, TCallback>): QueryFactoryOutput<
  TQuery,
  TKey,
  TData,
  TParams
> {
  // todo: get rid of ValidatedData<T> use NonValidatedFields<T> instead
  const assertValidity = (data: TParams, fields?: TField[]) =>
    sharedAssertValidity(validationSuite, data, fields) as unknown as TQuery

  const isEnabled = (params: TParams) =>
    checkValidity(validationSuite, params) && !dependencies?.(params).some((key) => !queryClient.getQueryData(key))

  const queryFn = ({ queryKey }: QueryFunctionContext<TKey>) => {
    logQuery(queryKey)
    return runQuery(getParamsFromQueryKey(queryKey))
  }

  const getQueryOptions = (params: TParams, enabled = true) =>
    queryOptions({
      queryKey: queryKey(params),
      queryFn,
      gcTime: REFRESH_INTERVAL[gcTime ?? '10m'],
      staleTime: REFRESH_INTERVAL[staleTime ?? '5m'],
      refetchInterval: refetchInterval ? REFRESH_INTERVAL[refetchInterval] : undefined,
      enabled: enabled && isEnabled(params),
      refetchOnWindowFocus,
      refetchOnMount,
    })

  return {
    assertValidity,
    checkValidity: (data: TParams, fields?: TField[]) => checkValidity(validationSuite, data, fields),
    isEnabled,
    queryKey,
    getQueryOptions,
    getQueryData: (params) => queryClient.getQueryData(queryKey(params)),
    setQueryData: (params, data) => queryClient.setQueryData<TData>(queryKey(params), data),
    prefetchQuery: (params, staleTime = 0) =>
      queryClient.prefetchQuery({ queryKey: queryKey(params), queryFn, staleTime }),
    fetchQuery: (params, options) => queryClient.fetchQuery({ ...getQueryOptions(params), ...options }),
    useQuery: createQueryHook(getQueryOptions),
    invalidate: (params) => queryClient.invalidateQueries({ queryKey: queryKey(params) }),
  }
}
