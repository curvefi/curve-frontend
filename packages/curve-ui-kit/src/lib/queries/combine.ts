import type { UseQueryOptions } from '@tanstack/react-query'
import { QueryOptionsArray, QueryResultsArray } from './types'

/** Combines the metadata of multiple queries into a single object. */
export const combineQueriesMeta = <T extends QueryOptionsArray>(results: QueryResultsArray<T>) => ({
  isLoading: results.some((result) => result.isLoading),
  isPending: results.some((result) => result.isPending),
  isError: results.some((result) => result.isError),
  isFetching: results.some((result) => result.isFetching),
  error: results.find((result) => result.error)?.error,
})

/** Combines the data and metadata of multiple queries into a single object. */
export const combineQueriesToObject = <TData, K extends string[]>(
  results: QueryResultsArray<UseQueryOptions<TData, Error, TData, unknown[]>[]>,
  keys: K,
) => ({
  // Using flatMap instead of map + filter(Boolean), because it's not correctly erasing | undefined from the Record value type
  data: Object.fromEntries(results.flatMap(({ data }, index) => (data !== undefined ? [[keys[index], data]] : []))),
  ...combineQueriesMeta(results),
})
