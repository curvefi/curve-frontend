import { useCallback, useMemo } from 'react'
import type { SortDirection as PoolSortDirection, V2PoolSortField as PoolSortField } from '@curvefi/prices-api/pools'
import { recordEntries } from '@primitives/objects.utils'
import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { POOL_TITLES, PoolColumnId, getDefaultPoolsSort } from '../columns'
import { POOL_SORT_BY, type PoolSortableColumn } from '../pools.constants'
import type { PoolsQueryUpdater } from '../pools.filter'

const SORT_QUERY_FIELD = 'sort'
const SORT_COLUMNS = {
  [PoolColumnId.PoolName]: {
    sortBy: POOL_SORT_BY[PoolColumnId.PoolName],
    label: POOL_TITLES[PoolColumnId.PoolName],
  },
  [PoolColumnId.RewardsBase]: {
    sortBy: POOL_SORT_BY[PoolColumnId.RewardsBase],
    label: POOL_TITLES[PoolColumnId.RewardsBase],
  },
  [PoolColumnId.Volume]: {
    sortBy: POOL_SORT_BY[PoolColumnId.Volume],
    label: POOL_TITLES[PoolColumnId.Volume],
  },
  [PoolColumnId.Tvl]: {
    sortBy: POOL_SORT_BY[PoolColumnId.Tvl],
    label: t`Total Value Locked`,
  },
} as const satisfies Record<PoolSortableColumn, { sortBy: PoolSortField; label: string }>

type ColumnSort = { id: PoolSortableColumn; desc: boolean }
export type PoolsSorting = [ColumnSort]
type PoolsSortParams = {
  sortBy: PoolSortField
  sortDirection: PoolSortDirection
  sortField: PoolSortableColumn
}

const SORT_OPTIONS = recordEntries(SORT_COLUMNS).map(([id, { label }]) => ({ id, label }))

const isPoolsSortColumn = (value: string | undefined): value is PoolSortableColumn =>
  value != null && value in SORT_COLUMNS

const isColumnSort = (sort: SortingState[number]): sort is ColumnSort => isPoolsSortColumn(sort.id)

const getPoolsSorting = (sorting: SortingState, defaultSort: SortingState): PoolsSorting => {
  const sort = sorting.find(isColumnSort) ?? defaultSort.find(isColumnSort)

  return sort ? [{ id: sort.id, desc: sort.desc }] : [{ id: PoolColumnId.Tvl, desc: true }]
}

const getPoolsSortParams = ([{ id: sortField, desc }]: PoolsSorting): PoolsSortParams => ({
  sortBy: SORT_COLUMNS[sortField].sortBy,
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
  const sorting = useMemo<PoolsSorting>(() => getPoolsSorting(urlSorting, defaultSort), [defaultSort, urlSorting])
  const { sortBy, sortDirection, sortField } = getPoolsSortParams(sorting)

  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    newSorting => {
      const nextSorting = getPoolsSorting(
        typeof newSorting == 'function' ? newSorting(sorting) : newSorting,
        defaultSort,
      )

      updateQueryAndResetPage({
        [SORT_QUERY_FIELD]: nextSorting.map(({ id, desc }) => `${desc ? '-' : ''}${id}`),
      })
    },
    [defaultSort, sorting, updateQueryAndResetPage],
  )

  return {
    onSortingChange,
    sortBy,
    sortDirection,
    sortField,
    sorting,
    sortOptions: SORT_OPTIONS,
  }
}
