import { useMemo } from 'react'
import { decimalMin } from '@evm-ui/utils/decimal'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries, notFalsy } from '@primitives/objects.utils'
import { DISABLED_Q, fallbackQ, q, Query, QueryProp } from '@ui/features/queries/util'

export const combineQueryState = (...queries: (Query<unknown> | undefined)[]) =>
  ({
    error: queries.find(x => x?.error)?.error ?? null,
    isLoading: queries.some(x => x?.isLoading),
  }) as Omit<QueryProp<unknown>, 'data'>

type Queries = readonly Query<unknown>[]
type QueriesData<TQueries extends Queries> = {
  [K in keyof TQueries]: TQueries[K] extends Query<infer TData> ? Exclude<TData, undefined> : never
}
/** a query with non-nullable data */
export type QueryWithData<TData> = Query<TData> & { data: NonNullable<TData> }

const combineQueryData = <const TQueries extends Queries, TResult>(
  queries: TQueries,
  selector: (...data: QueriesData<TQueries>) => TResult | null | undefined,
) =>
  queries.some(({ data }) => data === undefined)
    ? undefined
    : selector(...(queries.map(({ data }) => data) as QueriesData<TQueries>))

export const combineQueries = <const TQueries extends Queries, TResult>(
  queries: TQueries,
  selector: (...data: QueriesData<TQueries>) => TResult | null | undefined,
) => ({ data: combineQueryData(queries, selector), ...combineQueryState(...queries) }) as QueryProp<TResult>

export const pickQuery = <TData>(
  queries: readonly Query<TData>[],
  selector: (queries: readonly [QueryWithData<TData>, ...QueryWithData<TData>[]]) => QueryWithData<TData>,
) => {
  const [first, ...rest] = queries.filter((query): query is QueryWithData<TData> => query.data != null)
  return first ? selector([first, ...rest]) : (fallbackQ(...queries.map(q)) ?? DISABLED_Q)
}

export const useCombinedQueries = <const TQueries extends Queries, TResult>(
  queries: TQueries,
  selector: (...data: QueriesData<TQueries>) => TResult | null | undefined,
) =>
  ({
    data: useMemo(
      () => combineQueryData(queries, selector),
      // eslint-disable-next-line @eslint-react/exhaustive-deps
      [selector, ...queries.map(({ data }) => data)],
    ),
    ...combineQueryState(...queries),
  }) as QueryProp<TResult>

/** Combines multiple queries into a query whose data is keyed by the matching key list. */
export const combineQueriesToObject = <TData, K extends string = string>(results: Query<TData>[], keys: readonly K[]) =>
  q<Record<K, TData>>({
    data: results.some(({ data }) => data != null)
      ? fromEntries(notFalsy(...results.map(({ data }, index) => data != null && ([keys[index], data] as const))))
      : undefined,
    ...combineQueryState(...results),
  })

/**
 * Returns the minimum value from multiple queries returning Decimal values.
 */
export const queryMinimum = (...queries: Query<Decimal>[]) => ({
  data: queries.some(d => d.data == null) ? undefined : decimalMin(...queries.map(d => d.data!)),
  isLoading: queries.some(d => d?.isLoading),
  error: queries.map(d => d?.error).find(Boolean) ?? null,
})
