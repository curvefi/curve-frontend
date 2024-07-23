import { useQueries } from '@tanstack/react-query'
import { CombinedQueriesResult, QueryOptionsArray, QueryResultsArray } from './types'

export function useCombinedQueries<T extends QueryOptionsArray>(queryOptions: [...T]): CombinedQueriesResult<T> {
  return useQueries({
    queries: queryOptions,
    combine: combineQueries,
  })
}

function combineQueries<T extends QueryOptionsArray>(results: QueryResultsArray<T>): CombinedQueriesResult<T> {
  return {
    isLoading: results.some((result) => result.isLoading),
    data: results.map((result) => result.data),
    isPending: results.some((result) => result.isPending),
    isError: results.some((result) => result.isError),
    isFetching: results.some((result) => result.isFetching),
  }
}
