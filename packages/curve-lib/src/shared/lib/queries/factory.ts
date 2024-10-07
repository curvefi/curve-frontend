import { useQuery, QueryKey } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'

export function createQueryHook<TParams, TData, TQueryKey extends QueryKey>(
  getQueryOptions: (params: TParams, condition?: boolean) => UseQueryOptions<TData, Error, TData, TQueryKey>,
) {
  return (params: TParams, condition?: boolean) => {
    const options = getQueryOptions(params, condition)
    return useQuery<TData, Error, TData, TQueryKey>(options)
  }
}
