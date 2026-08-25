import { useMemo } from 'react'
import { fallbackQ, q, Query, QueryProp } from '@evm-ui/types/util'
import { decimalMin } from '@evm-ui/utils/decimal'
import type { Decimal } from '@primitives/decimal.utils'
import { assert, fromEntries, notFalsy } from '@primitives/objects.utils'

export const combineQueryState = (...queries: (Query<unknown> | undefined)[]) =>
  ({
    error: queries.find(x => x?.error)?.error ?? null,
    isLoading: queries.some(x => x?.isLoading),
  }) as Omit<QueryProp<unknown>, 'data'>

type Queries = readonly Query<unknown>[]
type QueriesData<TQueries extends Queries> = {
  [K in keyof TQueries]: TQueries[K] extends Query<infer TData> ? Exclude<TData, undefined> : never
}

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
  selector: (data: [NonNullable<TData>, ...NonNullable<TData>[]]) => TData,
) => {
  const [first, ...rest] = queries.map(q => q.data).filter(data => data != null)
  if (!first) return fallbackQ(...queries.map(q))
  const pickedData = selector([first, ...rest])
  const result = queries.find(({ data }) => data === pickedData)
  return assert(result, `No query data found for selector`)
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
