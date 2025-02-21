import { QueryFunctionContext, queryOptions } from '@tanstack/react-query'
import { CB } from 'vest-utils'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { logQuery } from '@ui-kit/lib/logging'
import { createQueryHook } from '@ui-kit/lib/queries'
import { assertValidity as sharedAssertValidity, checkValidity, FieldName, FieldsOf } from '@ui-kit/lib/validation'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model/time'
import { QueryFactoryInput, QueryFactoryOutput } from '@ui-kit/lib/types'

export function getParamsFromQueryKey<TKey extends readonly unknown[], TParams, TQuery, TField>(
  queryKey: TKey,
  assertValidity: (data: TParams, fields?: TField[]) => TQuery,
) {
  const queryParams = Object.fromEntries(
    queryKey.flatMap((i) => (i && typeof i === 'object' ? Object.entries(i) : [])),
  ) as TParams
  return assertValidity(queryParams)
}

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
  const assertValidity = (data: TParams, fields?: TField[]) =>
    sharedAssertValidity(validationSuite, data, fields) as unknown as TQuery

  const isEnabled = (params: TParams) =>
    checkValidity(validationSuite, params) && !dependencies?.(params).some((key) => !queryClient.getQueryData(key))

  const queryFn = ({ queryKey }: QueryFunctionContext<TKey>) => {
    logQuery(queryKey)
    const params = getParamsFromQueryKey(queryKey, assertValidity)
    return runQuery(params)
  }

  const getQueryOptions = (params: TParams, enabled = true) =>
    queryOptions({
      queryKey: queryKey(params),
      queryFn,
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
    prefetchQuery: (params, staleTime = 0) =>
      queryClient.prefetchQuery({ queryKey: queryKey(params), queryFn, staleTime }),
    fetchQuery: (params) => queryClient.fetchQuery(getQueryOptions(params, true)),
    useQuery: createQueryHook(getQueryOptions),
    invalidate: (params) => queryClient.invalidateQueries({ queryKey: queryKey(params) }),
  }
}
