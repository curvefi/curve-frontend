import { useCallback, useMemo } from 'react'
import type { SortDirection as PoolSortDirection, V2PoolSortField as PoolSortField } from '@curvefi/prices-api/pools'
import { useSortFromQueryString } from '@evm-ui/hooks/useSortFromQueryString'
import { recordEntries } from '@primitives/objects.utils'
import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { PoolColumnId, getDefaultPoolsSort, usePoolTitles } from '../columns'
import type { PoolsQueryUpdater } from '../filters/utils'

const POOL_SORT_BY = {
  [PoolColumnId.PoolName]: 'name',
  [PoolColumnId.NetRate]: 'aggregate_apr',
  [PoolColumnId.BaseRate]: 'base_daily_apr',
  [PoolColumnId.WeeklyBaseRate]: 'base_weekly_apr',
  [PoolColumnId.CrvRate]: 'crv_apr',
  [PoolColumnId.RewardsRate]: 'rewards_apr',
  [PoolColumnId.Volume]: 'volume',
  [PoolColumnId.Tvl]: 'tvl',
  [PoolColumnId.Age]: 'creation_date',
} as const satisfies Partial<Record<PoolColumnId, PoolSortField>>

type PoolSortableColumn = keyof typeof POOL_SORT_BY

const SORT_QUERY_FIELD = 'sort'
const LITE_SORT_COLUMNS = new Set<PoolColumnId>([
  PoolColumnId.PoolName,
  PoolColumnId.NetRate,
  PoolColumnId.CrvRate,
  PoolColumnId.RewardsRate,
  PoolColumnId.Tvl,
])

type ColumnSort = { id: PoolSortableColumn; desc: boolean }
export type PoolsSorting = [ColumnSort]
type PoolsSortParams = {
  sortBy: PoolSortField
  sortDirection: PoolSortDirection
  sortField: PoolSortableColumn
}

const getPoolsSorting = (sorting: SortingState, defaultSort: SortingState, isLite: boolean): PoolsSorting => {
  const sort = [...sorting, ...defaultSort].find(
    ({ id }) => Object.hasOwn(POOL_SORT_BY, id) && (!isLite || LITE_SORT_COLUMNS.has(id as PoolColumnId)),
  )

  return sort ? [{ id: sort.id as PoolSortableColumn, desc: sort.desc }] : [{ id: PoolColumnId.Tvl, desc: true }]
}

const getPoolsSortParams = ([{ id: sortField, desc }]: PoolsSorting): PoolsSortParams => ({
  sortBy: POOL_SORT_BY[sortField],
  // TanStack table state uses `desc`; the prices API expects `sort_direction`.
  sortDirection: desc ? 'desc' : 'asc',
  sortField,
})

/**
 * Keep sorting in TanStack's native `{ id, desc }` shape for the table and
 * `useSortFromQueryString`, then expose the prices API sort field/direction.
 */
export const usePoolsSorting = (isLite: boolean, updateQueryAndResetPage: PoolsQueryUpdater) => {
  const poolTitles = usePoolTitles()
  const defaultSort = useMemo<SortingState>(() => getDefaultPoolsSort(isLite), [isLite])
  const [urlSorting] = useSortFromQueryString(defaultSort, SORT_QUERY_FIELD)
  const sorting = useMemo<PoolsSorting>(
    () => getPoolsSorting(urlSorting, defaultSort, isLite),
    [defaultSort, isLite, urlSorting],
  )
  const { sortBy, sortDirection, sortField } = getPoolsSortParams(sorting)
  const sortOptions = useMemo(
    () => recordEntries(POOL_SORT_BY).map(([id]) => ({ id, label: poolTitles[id] })),
    [poolTitles],
  )
  const liteSortOptions = useMemo(
    () => sortOptions.filter(({ id }) => LITE_SORT_COLUMNS.has(id)),
    [sortOptions],
  )

  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    newSorting => {
      const nextSorting = getPoolsSorting(
        typeof newSorting == 'function' ? newSorting(sorting) : newSorting,
        defaultSort,
        isLite,
      )

      updateQueryAndResetPage({
        [SORT_QUERY_FIELD]: nextSorting.map(({ id, desc }) => `${desc ? '-' : ''}${id}`),
      })
    },
    [defaultSort, isLite, sorting, updateQueryAndResetPage],
  )

  return {
    onSortingChange,
    sortBy,
    sortDirection,
    sortField,
    sorting,
    sortOptions: isLite ? liteSortOptions : sortOptions,
  }
}
