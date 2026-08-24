import type { UseQueryOptions } from '@tanstack/react-query'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryOptionsData<T> = T extends UseQueryOptions<infer TData, any, any, any> ? TData : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any

/** Extracts the data type from a useQuery hook */
export type QueryData<TUseQuery extends AnyFunction> = NonNullable<ReturnType<TUseQuery>['data']>
