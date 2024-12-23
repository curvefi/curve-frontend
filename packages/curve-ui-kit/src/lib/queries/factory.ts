import type { UseQueryOptions } from '@tanstack/react-query'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { queryClient } from '../api/query-client'

export const createQueryHook =
  <TParams, TData, TQueryKey extends QueryKey>(
    getQueryOptions: (params: TParams, condition?: boolean) => UseQueryOptions<TData, Error, TData, TQueryKey>,
  ) =>
  (params: TParams, condition?: boolean) => {
    const options = getQueryOptions(params, condition)
    return useQuery<TData, Error, TData, TQueryKey>(options)
  }

export const createGetQueryData =
  <KeysObject extends Record<keyof KeysObject & string, (keyArgs: any) => readonly any[]>>(keys: KeysObject) =>
  <Result, Key extends keyof KeysObject = keyof KeysObject>(key: Key, keyData: Parameters<KeysObject[Key]>[0]) =>
    queryClient.getQueryData<Result>(keys[key](keyData))
