import type { Query } from '@ui-kit/types/util'

export const formatQueryValue = <T>(query: Query<T | null> | undefined, format: (value: NonNullable<T>) => string) =>
  query?.data != null ? format(query.data as NonNullable<T>) : undefined

export const combineQueryState = (queries: (Query<unknown> | undefined)[]) => ({
  error: queries && queries.reduce<Query<unknown>['error']>((acc, x) => acc ?? x?.error, undefined),
  loading: queries && queries.reduce<Query<unknown>['isLoading']>((acc, x) => acc || !!x?.isLoading, false),
})
