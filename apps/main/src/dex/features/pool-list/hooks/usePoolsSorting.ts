import { useCallback, useMemo } from 'react'
import type { SortDirection as PoolSortDirection, V2PoolSortField as PoolSortField } from '@curvefi/prices-api/pools'
import { recordEntries } from '@primitives/objects.utils'
import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { POOL_TITLES, PoolColumnId, getDefaultPoolsSort } from '../columns'
import type { PoolsQueryUpdater } from '../filters/utils'

const POOL_SORT_BY = {
  [PoolColumnId.PoolName]: 'name',
  [PoolColumnId.NetApy]: 'aggregate_apr',
  [PoolColumnId.BaseApy]: 'base_daily_apr',
  [PoolColumnId.WeeklyBaseApy]: 'base_weekly_apr',
  [PoolColumnId.CrvApy]: 'crv_apr',
  [PoolColumnId.RewardsApy]: 'rewards_apr',
  [PoolColumnId.Volume]: 'volume',
  [PoolColumnId.Tvl]: 'tvl',
  [PoolColumnId.Age]: 'creation_date',
} as const satisfies Partial<Record<PoolColumnId, PoolSortField>>

type PoolSortableColumn = keyof typeof POOL_SORT_BY

const SORT_QUERY_FIELD = 'sort'
const LITE_SORT_COLUMNS = new Set<string>([PoolColumnId.PoolName, PoolColumnId.Volume, PoolColumnId.Tvl])

type ColumnSort = { id: PoolSortableColumn; desc: boolean }
export type PoolsSorting = [ColumnSort]
type PoolsSortParams = {
  sortBy: PoolSortField
  sortDirection: PoolSortDirection
  sortField: PoolSortableColumn
}

const SORT_OPTIONS = recordEntries(POOL_SORT_BY).map(([id]) => ({ id, label: POOL_TITLES[id] }))
const LITE_SORT_OPTIONS = SORT_OPTIONS.filter(({ id }) => LITE_SORT_COLUMNS.has(id))

const getPoolsSorting = (sorting: SortingState, defaultSort: SortingState, isLite: boolean): PoolsSorting => {
  const sort = [...sorting, ...defaultSort].find(
    ({ id }) => Object.hasOwn(POOL_SORT_BY, id) && (!isLite || LITE_SORT_COLUMNS.has(id)),
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
  const defaultSort = useMemo<SortingState>(() => getDefaultPoolsSort(isLite), [isLite])
  const [urlSorting] = useSortFromQueryString(defaultSort, SORT_QUERY_FIELD)
  const sorting = useMemo<PoolsSorting>(
    () => getPoolsSorting(urlSorting, defaultSort, isLite),
    [defaultSort, isLite, urlSorting],
  )
  const { sortBy, sortDirection, sortField } = getPoolsSortParams(sorting)

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
    sortOptions: isLite ? LITE_SORT_OPTIONS : SORT_OPTIONS,
  }
}
