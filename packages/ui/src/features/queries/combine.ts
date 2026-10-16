import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries, notFalsy, type Nullish } from '@primitives/objects.utils'
import { DISABLED_Q, fallbackQ, q, Query, QueryProp } from '@ui/features/queries/util'
import { decimalMin } from '@ui/lib/decimal'

export const combineQueryState = (...queries: (Query<unknown> | undefined)[]) =>
  ({ error: queries.find(x => x?.error)?.error ?? null, isLoading: queries.some(x => x?.isLoading) }) as Omit<
    QueryProp<unknown>,
    'data'
  >

type Queries = readonly Query<unknown>[]
type QueriesData<TQueries extends Queries> = {
  [K in keyof TQueries]: TQueries[K] extends Query<infer TData> ? Exclude<TData, undefined> : never
}
type QueriesDataInput<TQueries extends Queries> = { [K in keyof TQueries]: TQueries[K]['data'] }
/** a query with non-nullable data */
export type QueryWithData<TData> = Query<TData> & { data: NonNullable<TData> }

const getQueriesData = <const TQueries extends Queries>(queries: TQueries) =>
  queries.map(({ data }) => data) as QueriesDataInput<TQueries>

const combineQueryData = <const TQueries extends Queries, TResult>(
  data: QueriesDataInput<TQueries>,
  selector: (...data: QueriesData<TQueries>) => TResult | Nullish,
) => (data.some(value => value === undefined) ? undefined : selector(...(data as QueriesData<TQueries>)))

export const combineQueries = <const TQueries extends Queries, TResult>(
  queries: TQueries,
  selector: (...data: QueriesData<TQueries>) => TResult | Nullish,
) =>
  ({
    data: combineQueryData<TQueries, TResult>(getQueriesData(queries), selector),
    ...combineQueryState(...queries),
  }) as QueryProp<TResult>

/** Includes loading/error state of upstream queries as the final query awaits those inputs (and thus is disabled in the meantime) */
export const dependentQuery = <T>(...queries: [Query<unknown>, ...Query<unknown>[], Query<T>]) =>
  combineQueries(queries, (...data) => data.at(-1) as T)

/** Maps a query's data to another query, and combines the results into a single one. */
export const combineSubQueries = <Q1, Q2, R>(
  query: Query<Q1[]>,
  getItem: (row: Q1) => Query<Q2> | undefined,
  combine: (...amounts: (Q2 | undefined)[]) => R | undefined,
) => {
  const subQueries = notFalsy(...(query.data?.map(getItem) ?? []))
  return q({
    data: subQueries.some(q => q.data != null) ? combine(...subQueries.map(r => r.data)) : undefined,
    ...combineQueryState(query, ...subQueries),
  })
}

export const pickQuery = <TData>(
  queries: readonly Query<TData>[],
  selector: (queries: readonly [QueryWithData<TData>, ...QueryWithData<TData>[]]) => QueryWithData<TData>,
) => {
  const [first, ...rest] = queries.filter((query): query is QueryWithData<TData> => query.data != null)
  return first ? selector([first, ...rest]) : (fallbackQ(...queries.map(q)) ?? DISABLED_Q)
}

export const useCombinedQueries = <const TQueries extends Queries, TResult>(
  queries: TQueries,
  selector: (...data: QueriesData<TQueries>) => TResult | Nullish,
) => {
  const data = useShallow(getQueriesData<TQueries>)(queries)
  return {
    data: useMemo(() => combineQueryData<TQueries, TResult>(data, selector), [data, selector]),
    ...combineQueryState(...queries),
  } as QueryProp<TResult>
}

/** Keys individual queries without merging their data, loading, or error states. */
export const combineQueriesToObject = <TData, K extends string = string>(results: Query<TData>[], keys: readonly K[]) =>
  fromEntries(results.map((result, index) => [keys[index], q(result)]))

/**
 * Returns the minimum value from multiple queries returning Decimal values.
 */
export const queryMinimum = (...queries: Query<Decimal>[]) => ({
  data: queries.some(d => d.data == null) ? undefined : decimalMin(...queries.map(d => d.data!)),
  isLoading: queries.some(d => d?.isLoading),
  error: queries.map(d => d?.error).find(Boolean) ?? null,
})
