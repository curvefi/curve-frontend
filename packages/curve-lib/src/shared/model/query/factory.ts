import { QueryFunctionContext, queryOptions } from '@tanstack/react-query'
import { CB } from 'vest-utils'
import { queryClient } from '@/shared/api/query-client'
import { logQuery } from '@/shared/lib/logging'
import { createQueryHook } from '@/shared/lib/queries'
import { assertValidity as sharedAssertValidity, checkValidity, FieldName, FieldsOf } from '@/shared/lib/validation'
import { REFRESH_INTERVAL } from '@/shared/model/time'
import { QueryFactoryInput, QueryFactoryOutput } from '../../types'

const extractQueryParams = (queryKey: readonly unknown[]) =>
  (Object.fromEntries(queryKey.flatMap(i => i && typeof i === 'object' ? Object.entries(i) : [])))

export function queryFactory<
  TQuery extends object,
  TKey extends readonly unknown[],
  TData,
  TParams extends FieldsOf<TQuery> = FieldsOf<TQuery>,
  TField extends FieldName<TParams> = FieldName<TParams>,
  TGroup extends string = string,
  TCallback extends CB = CB<TQuery, TField[]>
>({
    queryFn, queryKey, staleTime, refetchInterval, validationSuite, dependencies, refetchOnWindowFocus, refetchOnMount
  }: QueryFactoryInput<TQuery, TKey, TData, TParams, TField, TGroup, TCallback>): QueryFactoryOutput<TQuery, TKey, TData, TParams> {

  // todo: get rid of ValidatedData<T> use NonValidatedFields<T> instead
  const assertValidity = (data: TParams, fields?: TField[]) => (sharedAssertValidity(validationSuite, data, fields) as unknown as TQuery)

  const isEnabled = (params: TParams) => checkValidity(validationSuite, params) && !dependencies?.(params).some(key => !queryClient.getQueryData(key))

  const getQueryOptions = (params: TParams, enabled = true) =>
    queryOptions({
      queryKey: queryKey(params),
      queryFn: ({ queryKey }: QueryFunctionContext<TKey>) => {
        logQuery(queryKey)
        const queryParams = extractQueryParams(queryKey) as TParams
        const params = assertValidity(queryParams)
        return queryFn(params)
      },
      staleTime: staleTime ? REFRESH_INTERVAL[staleTime] : undefined,
      refetchInterval: refetchInterval ? REFRESH_INTERVAL[refetchInterval] : undefined,
      enabled: enabled && isEnabled(params),
      refetchOnWindowFocus,
      refetchOnMount,
    })

  return {
    assertValidity,
    checkValidity: (data: TParams, fields?: TField[]) => checkValidity(validationSuite, data, fields),
    isEnabled: isEnabled,
    queryKey,
    getQueryOptions,
    getQueryData: params => queryClient.getQueryData(queryKey(params)),
    useQuery: createQueryHook(getQueryOptions),
    invalidate: params => queryClient.invalidateQueries({ queryKey: queryKey(params) })
  }
}
