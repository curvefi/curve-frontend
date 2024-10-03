import { useQueries } from '@tanstack/react-query'
import {
  CombinedQueriesResult,
  ExtractDataType,
  PartialQueryResult,
  QueryOptionsArray,
  QueryResultsArray
} from './types'
import { useMemo } from 'react'

const combineQueriesMeta = <T extends QueryOptionsArray>(results: QueryResultsArray<T>): Omit<CombinedQueriesResult<T>, 'data'> => ({
  isLoading: results.some((result) => result.isLoading),
  isPending: results.some((result) => result.isPending),
  isError: results.some((result) => result.isError),
  isFetching: results.some((result) => result.isFetching),
})

const combineQueriesToList = <T extends QueryOptionsArray>(results: QueryResultsArray<T>): CombinedQueriesResult<T> => ({
  data: results.map((result) => result.data),
  ...combineQueriesMeta(results),
})

export const useCombinedQueries = <T extends QueryOptionsArray>(queryOptions: [...T]): CombinedQueriesResult<T> => useQueries({
  queries: queryOptions,
  combine: combineQueriesToList,
})

export const useQueryMapping = <T extends QueryOptionsArray, K extends string>(queryOptions: [...T], keys: K[]) => {
  const { data, ...meta } = useCombinedQueries(queryOptions)
  return useMemo(() => ({
    ...meta,
    data: Object.fromEntries((data || []).map((result, index) => [keys[index], result])) as Record<K, ExtractDataType<T[number]>>
  }), [data, meta, keys])
}
