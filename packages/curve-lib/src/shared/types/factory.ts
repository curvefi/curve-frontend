import type { DefaultError } from '@tanstack/query-core'
import { QueryFunction, QueryKey } from '@tanstack/react-query'
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query/src/types'
import { Suite } from 'vest'
import { CB } from 'vest-utils'
import { FieldName, NonValidatedFields } from '@/shared/lib/validation'
import { REFRESH_INTERVAL } from '@/shared/model/time'

export type QueryFactoryInput<
  TValidParams extends object,
  TKey extends QueryKey,
  TData,
  TParams extends NonValidatedFields<TValidParams> = NonValidatedFields<TValidParams>,
  TField extends string = FieldName<TValidParams>,
  TGroup extends string = string,
  TCallback extends CB = CB<TValidParams, TField[]>
> = {
  queryKey: (params: TParams, enabled?: boolean) => TKey
  queryParams: (key: TKey) => TParams
  validationSuite: Suite<TField, TGroup, TCallback>
  query: (params: TValidParams) => Promise<TData>
  staleTime: keyof typeof REFRESH_INTERVAL
  dependencies?: (params: TParams) => QueryKey[]
}

export type QueryFactoryOutput<
  TValidParams extends object,
  TKey extends QueryKey,
  TData,
  TParams extends NonValidatedFields<TValidParams> = NonValidatedFields<TValidParams>,
  TError = DefaultError
> = {
  getQueryOptions: (params: TParams) => UseQueryOptions<TData, TError, TData, TKey>
  queryKey: (params: TParams) => TKey
  checkValidity: (data: TParams) => boolean
  isEnabled: (data: TParams) => boolean
  assertValidity: (data: TParams) => TValidParams
  useQuery: (params: TParams) => UseQueryResult<TData, TError>
  getQueryData: (params: TParams) => TData | undefined
  invalidate: (params: TParams) => void
}
