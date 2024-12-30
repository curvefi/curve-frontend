import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { useCallback } from 'react'
import {
  CombinedQueriesResult,
  CombinedQueryMappingResult,
  ExtractDataType,
  QueryOptionsArray,
  QueryResultsArray,
} from './types'

/** Combines the metadata of multiple queries into a single object. */
const combineQueriesMeta = <T extends QueryOptionsArray>(
  results: QueryResultsArray<T>,
): Omit<CombinedQueriesResult<T>, 'data'> => ({
  isLoading: results.some((result) => result.isLoading),
  isPending: results.some((result) => result.isPending),
  isError: results.some((result) => result.isError),
  isFetching: results.some((result) => result.isFetching),
})

/** Combines the data and metadata of multiple queries into a single object. */
const combineQueriesToList = <T extends QueryOptionsArray>(
  results: QueryResultsArray<T>,
): CombinedQueriesResult<T> => ({
  data: results.map((result) => result.data),
  ...combineQueriesMeta(results),
})

/** Combines the data and metadata of multiple queries into a single object. */
const combineQueriesToObject = <T extends QueryOptionsArray, K extends string[]>(
  results: QueryResultsArray<T>,
  keys: K,
): CombinedQueryMappingResult<T, K> => ({
  data: Object.fromEntries((results || []).map(({ data }, index) => [keys[index], data])) as Record<
    K[number],
    ExtractDataType<T[number]>
  >,
  ...combineQueriesMeta(results),
})

/**
 * Combines multiple queries into a single list.
 * @param queryOptions The query options to combine
 * @returns The combined queries in a list
 */
export const useCombinedQueries = <T extends QueryOptionsArray>(queryOptions: [...T]): CombinedQueriesResult<T> =>
  useQueries({
    queries: queryOptions,
    combine: combineQueriesToList,
  })

/**
 * Combines multiple queries into a single object with keys for each query
 * @param queryOptions The query options to combine
 * @param keys The keys to use for each query
 * @returns The combined queries in an object
 */
export const useQueryMapping = <T extends QueryOptionsArray, K extends string[]>(
  queryOptions: [...T],
  keys: [...K],
): CombinedQueryMappingResult<T, K> =>
  useQueries({
    queries: queryOptions,
    combine: useCallback((results: UseQueryResult<unknown, Error>[]) => combineQueriesToObject(results, keys), [keys]),
  })
