import type { IsStringLiteral, SingleKeyObject } from 'type-fest'
import type { DefaultError } from '@tanstack/query-core'
import type { FetchQueryOptions, QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import type { REFRESH_INTERVAL } from '@ui-kit/lib/model/time'
import type { FieldName, FieldsOf } from '@ui-kit/lib/validation'
import type { Suite } from '@ui-kit/lib/validation/lib'

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
> = {
  queryKey: (params: TParams) => QueryKeyTuple<TKey>
  validationSuite: Suite<TField, TGroup>
  queryFn: (params: TValidParams) => Promise<TData>
  gcTime?: keyof typeof REFRESH_INTERVAL
  staleTime?: keyof typeof REFRESH_INTERVAL
  refetchInterval?: keyof typeof REFRESH_INTERVAL
  dependencies?: (params: TParams) => QueryKey[]
  refetchOnWindowFocus?: 'always'
  refetchOnMount?: 'always'
  disableLog?: true
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
  useQuery: (params: TParams, enabled?: boolean) => UseQueryResult<TData, TError>
  getQueryData: (params: TParams) => TData | undefined
  setQueryData: (params: TParams, data: TData) => void
  prefetchQuery: (params: TParams, staleTime?: number) => Promise<void>
  fetchQuery: (params: TParams, options?: Partial<FetchQueryOptions<TData, TError, TData, TKey>>) => Promise<TData>
  refetchQuery: (params: TParams) => Promise<TData>
  invalidate: (params: TParams) => void
}
