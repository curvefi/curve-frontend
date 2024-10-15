import { QueryFunctionContext, QueryKey, queryOptions } from '@tanstack/react-query'
import { CB } from 'vest-utils'
import { queryClient } from '@/shared/api/query-client'
import { logQuery } from '@/shared/lib/logging'
import { createQueryHook } from '@/shared/lib/queries'
import {
  assertValidity as sharedAssertValidity,
  checkValidity,
  FieldName,
  NonValidatedFields
} from '@/shared/lib/validation'
import { REFRESH_INTERVAL } from '@/shared/model/time'
import { QueryFactoryInput, QueryFactoryOutput } from '@/shared/types/factory'

export function queryFactory<
  TValidParams extends object,
  TKey extends QueryKey,
  TData,
  TParams extends NonValidatedFields<TValidParams> = NonValidatedFields<TValidParams>,
  TField extends FieldName<TParams> = FieldName<TParams>,
  TGroup extends string = string,
  TCallback extends CB = CB<TValidParams, TField[]>
>({
    query, queryParams, queryKey, staleTime, validationSuite, dependencies
  }: QueryFactoryInput<TValidParams, TKey, TData, TParams, TField, TGroup, TCallback>): QueryFactoryOutput<TValidParams, TKey, TData, TParams> {

  // todo: get rid of ValidatedData<T> use NonValidatedFields<T> instead
  const assertValidity = (data: TParams, fields?: TField[]) => (sharedAssertValidity(validationSuite, data, fields) as unknown as TValidParams)

  const queryFn = ({ queryKey }: QueryFunctionContext<TKey>) => {
    logQuery(queryKey)
    const params = assertValidity(queryParams(queryKey))
    return query(params)
  }

  const isEnabled = (params: TParams) => checkValidity(validationSuite, params) && !dependencies?.(params).find(key => !queryClient.getQueryData(key))

  const getQueryOptions = (params: TParams, enabled = true) =>
    queryOptions({
      queryKey: queryKey(params),
      queryFn,
      staleTime: REFRESH_INTERVAL[staleTime],
      enabled: enabled && isEnabled(params)
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
