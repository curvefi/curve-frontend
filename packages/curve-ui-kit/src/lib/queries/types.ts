import { UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

export type QueryOptionsArray = readonly UseQueryOptions<any, any, any, any>[]

export type ExtractDataType<T> = T extends UseQueryOptions<infer TData, any, any, any> ? TData : unknown

export type CombinedDataType<T extends QueryOptionsArray> = ExtractDataType<T[number]>[]

export type QueryResultsArray<T extends QueryOptionsArray> = {
  [K in keyof T]: T[K] extends UseQueryOptions<infer TData, any, any, any> ? UseQueryResult<TData> : never
}

export type PartialQueryResult<T> = Pick<
  UseQueryResult<T>,
  'data' | 'isLoading' | 'isPending' | 'isError' | 'isFetching'
>

export type CombinedQueriesResult<T extends QueryOptionsArray> = PartialQueryResult<CombinedDataType<T>>

export type CombinedQueryMappingResult<T extends QueryOptionsArray, K extends string[]> = PartialQueryResult<
  Record<K[number], CombinedDataType<T>[number]>
>
