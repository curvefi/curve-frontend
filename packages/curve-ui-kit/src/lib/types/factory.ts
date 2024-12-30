import type { DefaultError } from '@tanstack/query-core'
import type { QueryKey } from '@tanstack/react-query'
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query/src/types'
import type { IsStringLiteral, SingleKeyObject } from 'type-fest'
import type { Suite } from 'vest'
import type { CB } from 'vest-utils'
import type { FieldName, FieldsOf } from '@ui-kit/lib/validation'
import type { REFRESH_INTERVAL } from '@ui-kit/lib/model/time'

// Checks if T is a string literal or an object with one property
type IsLiteralOrSingleKeyObject<T> =
  IsStringLiteral<T> extends true ? true : T extends SingleKeyObject<T> ? true : false

// Recursively checks each element in the tuple
type AreAllElementsLiteralOrSinglePropertyObject<T extends readonly unknown[]> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? IsLiteralOrSingleKeyObject<First> extends true
    ? AreAllElementsLiteralOrSinglePropertyObject<Rest>
    : false
  : true

// Combined type that ensures T is a tuple and all elements pass the checks
export type QueryKeyTuple<T extends readonly unknown[]> = T extends readonly [...infer Elements]
  ? number extends Elements['length']
    ? never // Not a tuple
    : AreAllElementsLiteralOrSinglePropertyObject<T> extends true
      ? T // Valid tuple
      : never // Elements fail the check
  : never // Not an array

export type QueryFactoryInput<
  TValidParams extends object,
  TKey extends readonly unknown[],
  TData,
  TParams extends FieldsOf<TValidParams> = FieldsOf<TValidParams>,
  TField extends string = FieldName<TValidParams>,
  TGroup extends string = string,
  TCallback extends CB = CB<TValidParams, TField[]>,
> = {
  queryKey: (params: TParams) => QueryKeyTuple<TKey>
  validationSuite: Suite<TField, TGroup, TCallback>
  queryFn: (params: TValidParams) => Promise<TData>
  staleTime?: keyof typeof REFRESH_INTERVAL
  refetchInterval?: keyof typeof REFRESH_INTERVAL
  dependencies?: (params: TParams) => QueryKey[]
  refetchOnWindowFocus?: 'always'
  refetchOnMount?: 'always'
}

export type QueryFactoryOutput<
  TValidParams extends object,
  TKey extends readonly unknown[],
  TData,
  TParams extends FieldsOf<TValidParams> = FieldsOf<TValidParams>,
  TError = DefaultError,
> = {
  getQueryOptions: (params: TParams, enabled?: boolean) => UseQueryOptions<TData, TError, TData, TKey>
  queryKey: (params: TParams) => QueryKeyTuple<TKey>
  checkValidity: (data: TParams) => boolean
  isEnabled: (data: TParams) => boolean
  assertValidity: (data: TParams) => TValidParams
  useQuery: (params: TParams, enabled?: boolean) => UseQueryResult<TData, TError>
  getQueryData: (params: TParams) => TData | undefined
  prefetchQuery: (params: TParams, staleTime?: number) => Promise<void>
  invalidate: (params: TParams) => void
}
