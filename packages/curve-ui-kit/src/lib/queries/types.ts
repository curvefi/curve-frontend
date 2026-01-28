import { UseQueryOptions, UseQueryResult } from '@tanstack/react-query'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryOptionsArray = readonly UseQueryOptions<any, any, any, any>[]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryOptionsData<T> = T extends UseQueryOptions<infer TData, any, any, any> ? TData : never

export type QueryResultsArray<T extends QueryOptionsArray> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends UseQueryOptions<infer TData, any, any, any> ? UseQueryResult<TData> : never
}

export type PartialQueryResult<T> = Pick<
  UseQueryResult<T>,
  'data' | 'isLoading' | 'isPending' | 'isError' | 'isFetching'
>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any[]) => any

/** Extracts the data type from a useQuery hook */
export type QueryData<TUseQuery extends AnyFunction> = NonNullable<ReturnType<TUseQuery>['data']>
