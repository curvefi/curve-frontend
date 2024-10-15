import { QueryFunctionContext, QueryKey, queryOptions } from '@tanstack/react-query'
import { CB } from 'vest-utils'
import { queryClient } from '@/shared/api/query-client'
import { logQuery } from '@/shared/lib/logging'
import { createQueryHook } from '@/shared/lib/queries'
import { assertValidity, checkValidity, ValidatedData } from '@/shared/lib/validation'
import { REFRESH_INTERVAL } from '@/shared/model/time'
import { QueryFactoryInput, QueryFactoryOutput } from '@/shared/types/factory'

export function queryFactory<TParams extends object, TKey extends QueryKey, TData, TField extends string = keyof TParams & string, TGroup extends string = string, TCallback extends CB = CB<TParams, TField[]>>({
  query, queryParams, queryKey, staleTime, validationSuite, dependencies
}: QueryFactoryInput<TParams, TKey, TData, TField, TGroup, TCallback>): QueryFactoryOutput<TParams, TKey, TData> {

  const queryFn = ({ queryKey }: QueryFunctionContext<TKey>) => {
    logQuery(queryKey)
    const params = assertValidity(validationSuite, queryParams(queryKey))
    return query(params)
  }

  const getQueryOptions = (params: TParams, enabled = true) =>
    queryOptions({
      queryKey: queryKey(params),
      queryFn,
      staleTime: REFRESH_INTERVAL[staleTime],
      enabled: enabled && checkValidity(validationSuite, params) && !dependencies?.(params).find(key => !queryClient.getQueryData(key))
    })

  return {
    assertValidity: (data: TParams, fields?: Extract<keyof TParams, string>[]): ValidatedData<TParams> =>
      assertValidity(validationSuite, data, fields),
    checkValidity: (data: TParams, fields?: Extract<keyof TParams, string>[]): boolean =>
      checkValidity(validationSuite, data, fields),
    queryKey,
    getQueryOptions,
    getQueryData: params => queryClient.getQueryData(queryKey(params)),
    useQuery: createQueryHook(getQueryOptions),
    invalidate: params => queryClient.invalidateQueries({ queryKey: queryKey(params) })
  }
}
