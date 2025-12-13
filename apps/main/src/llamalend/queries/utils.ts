import type { Query } from '@ui-kit/types/util'

/**
 * Maps a Query type to extract partial data from it.
 * Preserves error and loading states while transforming the data.
 */
export const mapQuery = <TSource, TResult>(query: Query<TSource>, selector: (data: TSource) => TResult) => ({
  ...query,
  data: query.data && selector(query.data),
})

export const formatQueryValue = <T>(query: Query<T | null> | undefined, format: (value: NonNullable<T>) => string) =>
  query?.data != null ? format(query.data as NonNullable<T>) : undefined

export const combineQueryState = (queries: (Query<unknown> | undefined)[]) => ({
  error: queries && queries.reduce<Query<unknown>['error']>((acc, x) => acc ?? x?.error, undefined),
  loading: queries && queries.reduce<Query<unknown>['isLoading']>((acc, x) => acc || !!x?.isLoading, false),
})
