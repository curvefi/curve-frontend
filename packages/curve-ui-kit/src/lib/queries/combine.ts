import { useCallback } from 'react'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import {
  CombinedQueriesResult,
  CombinedQueryMappingResult,
  ExtractDataType,
  QueryOptionsArray,
  QueryResultsArray,
} from './types'
import { QueriesOptions, QueriesResults } from '@tanstack/react-query/build/legacy/useQueries'

/** Combines the metadata of multiple queries into a single object. */
export const combineQueriesMeta = <T extends QueryOptionsArray>(
  results: QueryResultsArray<T>,
): Omit<CombinedQueriesResult<T>, 'data'> => ({
  isLoading: results.some((result) => result.isLoading),
  isPending: results.some((result) => result.isPending),
  isError: results.some((result) => result.isError),
  isFetching: results.some((result) => result.isFetching),
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
 * Combines multiple queries into a single object with keys for each query
 * @param queries The query options to combine
 * @param keys The keys to use for each query
 * @returns The combined queries in an object
 */
export const useQueryMapping = <TOptions extends Array<any>, TKey extends string[]>(
  queries: readonly [...QueriesOptions<TOptions>],
  keys: [...TKey],
) =>
  useQueries({
    // todo: figure out why the type has broken in react-query, related to https://github.com/TanStack/query/pull/8624
    queries: queries as Parameters<typeof useQueries>[0]['queries'],
    combine: useCallback((results: QueriesResults<TKey>) => combineQueriesToObject(results, keys), [keys]),
  })
