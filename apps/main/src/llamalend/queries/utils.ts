import type { Query } from '../widgets/manage-loan/loan.types'

/**
 * Maps a Query type to extract partial data from it.
 * Preserves error and loading states while transforming the data.
 */
export function mapQuery<TSource, TResult>(
  query: Query<TSource>,
  selector: (data: TSource) => TResult,
): Query<TResult> {
  return {
    data: query.data === undefined ? undefined : selector(query.data),
    isLoading: query.isLoading,
    error: query.error,
  }
}
