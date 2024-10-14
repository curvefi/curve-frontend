import { QueryKey, queryOptions } from '@tanstack/react-query'
import { CB } from 'vest-utils'
import { queryClient } from '@/shared/api/query-client'
import { logQuery } from '@/shared/lib/logging'
import { createQueryHook } from '@/shared/lib/queries'
import { assertValidity, checkValidity, ValidatedData } from '@/shared/lib/validation'
import { REFRESH_INTERVAL } from '@/shared/model/time'
import { QueryFactoryInput, QueryFactoryOutput } from '@/shared/types/factory'

export function queryFactory<TParams extends object, TKey extends QueryKey, TData, TField extends string = string, TGroup extends string = string, TCallback extends CB = CB<TParams, []>>({
  query, recoverKey, createKey, staleTime, validationSuite, dependencies
}: QueryFactoryInput<TParams, TKey, TData, TField, TGroup, TCallback>): QueryFactoryOutput<TParams, TKey, TData> {

  const getQueryOptions = (params: TParams, enabled = true) =>
    queryOptions({
      queryKey: createKey(params),
      queryFn: ({ queryKey }) => {
        logQuery(queryKey)
        return query(recoverKey(queryKey))
      },
      staleTime: REFRESH_INTERVAL[staleTime],
      enabled: enabled && checkValidity(validationSuite, params) && !dependencies?.(params).find(key => !queryClient.getQueryData(key)),
    })

  return {
    assertValidity: (data: TParams, fields?: Extract<keyof TParams, string>[]): ValidatedData<TParams> =>
      assertValidity(validationSuite, data, fields),
    checkValidity: (data: TParams, fields?: Extract<keyof TParams, string>[]): boolean =>
      checkValidity(validationSuite, data, fields),
    createKey,
    getQueryOptions,
    getQueryData: params => queryClient.getQueryData(createKey(params)),
    useQuery: createQueryHook(getQueryOptions),
    invalidate: params => queryClient.invalidateQueries({ queryKey: createKey(params) })
  }
}
