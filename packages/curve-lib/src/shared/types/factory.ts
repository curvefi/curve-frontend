import type { DefaultError } from '@tanstack/query-core'
import { QueryKey } from '@tanstack/react-query'
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query/src/types'
import { Suite } from 'vest'
import { CB } from 'vest-utils'
import { FieldName, ValidatedData } from '@/shared/lib/validation'
import { REFRESH_INTERVAL } from '@/shared/model/time'

export type QueryFactoryInput<TParams extends object, TKey extends QueryKey, TData, TField extends string = FieldName<TParams>, TGroup extends string = string, TCallback extends CB = CB<TParams, TField[]>> = {
  queryKey: (params: TParams, enabled?: boolean) => TKey
  queryParams: (key: TKey) => TParams
  validationSuite: Suite<TField, TGroup, TCallback>
  query: (params: ValidatedData<TParams>) => Promise<TData>
  staleTime: keyof typeof REFRESH_INTERVAL
  dependencies?: (params: TParams) => QueryKey[]
}

export type QueryFactoryOutput<TParams extends object, TKey extends QueryKey, TData, TError = DefaultError> = {
  getQueryOptions: (params: TParams) => UseQueryOptions<TData, TError, TData, TKey>
  queryKey: (params: TParams) => TKey
  checkValidity: (data: TParams) => boolean
  assertValidity: (data: TParams) => ValidatedData<TParams>
  useQuery: (params: TParams) => UseQueryResult<TData, TError>
  getQueryData: (params: TParams) => TData | undefined
  invalidate: (params: TParams) => void
}
