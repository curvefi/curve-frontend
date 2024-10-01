import { UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

export type QueryOptionsArray = readonly UseQueryOptions<any, any, any, any>[]

export type ExtractDataType<T> = T extends UseQueryOptions<infer TData, any, any, any> ? TData : unknown

export type CombinedDataType<T extends QueryOptionsArray> = ExtractDataType<T[number]>[]

export type QueryResultsArray<T extends QueryOptionsArray> = {
  [K in keyof T]: T[K] extends UseQueryOptions<infer TData, any, any, any> ? UseQueryResult<TData> : never
}

export type CombinedQueriesResult<T extends QueryOptionsArray> = {
  isLoading: boolean
  data: CombinedDataType<T>
  isPending: boolean
  isError: boolean
  isFetching: boolean
}
