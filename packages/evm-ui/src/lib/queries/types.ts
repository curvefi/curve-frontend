import type { UseQueryOptions } from '@tanstack/react-query'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryOptionsData<T> = T extends UseQueryOptions<infer TData, any, any, any> ? TData : never
