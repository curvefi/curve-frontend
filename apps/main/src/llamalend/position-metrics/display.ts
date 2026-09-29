import { q, type Query } from '@ui/features/queries/util'

/** A failed refetch keeps the previous payload instead of replacing it with an error icon. */
export const keepDisplayedValue = <T,>(query: Query<T>) =>
  q(query.data != null && query.error != null ? { data: query.data, isLoading: query.isLoading, error: null } : query)
