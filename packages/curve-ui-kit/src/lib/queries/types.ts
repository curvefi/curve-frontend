import { UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

export type QueryOptionsArray = readonly UseQueryOptions<any, any, any, any>[]

export type QueryResultsArray<T extends QueryOptionsArray> = {
  [K in keyof T]: T[K] extends UseQueryOptions<infer TData, any, any, any> ? UseQueryResult<TData> : never
}

export type PartialQueryResult<T> = Pick<
  UseQueryResult<T>,
  'data' | 'isLoading' | 'isPending' | 'isError' | 'isFetching'
>

/** Extracts the data type from a useQuery hook */
export type QueryData<TUseQuery extends (...args: any[]) => any> = NonNullable<ReturnType<TUseQuery>['data']>
