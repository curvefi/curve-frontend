import type { UseQueryOptions } from '@tanstack/react-query'
import { QueryKey, useQuery } from '@tanstack/react-query'

export const createQueryHook =
  <TParams, TData, TQueryKey extends QueryKey>(
    getQueryOptions: (params: TParams, condition?: boolean) => UseQueryOptions<TData, Error, TData, TQueryKey>,
  ) =>
  (params: TParams, condition?: boolean) => {
    const options = getQueryOptions(params, condition)
    return useQuery<TData, Error, TData, TQueryKey>(options)
  }
