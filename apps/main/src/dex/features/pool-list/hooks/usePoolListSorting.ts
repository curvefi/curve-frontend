import { useCallback, useMemo } from 'react'
import type { SortDirection as PoolSortDirection, V2PoolSortField as PoolSortField } from '@curvefi/prices-api/pools'
import { recordEntries } from '@primitives/objects.utils'
import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { POOL_LIST_TITLES, PoolListColumnId, getDefaultSort } from '../columns'
import { POOL_LIST_SORT_BY, type PoolListSortableColumn } from '../poolList.constants'
import type { PoolListQueryUpdater } from './usePoolListPagination'

const SORT_QUERY_FIELD = 'sort'
const SORT_COLUMNS = {
  [PoolListColumnId.PoolName]: {
    sortBy: POOL_LIST_SORT_BY[PoolListColumnId.PoolName],
    label: POOL_LIST_TITLES[PoolListColumnId.PoolName],
  },
  [PoolListColumnId.RewardsBase]: {
    sortBy: POOL_LIST_SORT_BY[PoolListColumnId.RewardsBase],
    label: POOL_LIST_TITLES[PoolListColumnId.RewardsBase],
  },
  [PoolListColumnId.Volume]: {
    sortBy: POOL_LIST_SORT_BY[PoolListColumnId.Volume],
    label: POOL_LIST_TITLES[PoolListColumnId.Volume],
  },
  [PoolListColumnId.Tvl]: {
    sortBy: POOL_LIST_SORT_BY[PoolListColumnId.Tvl],
    label: t`Total Value Locked`,
  },
} as const satisfies Record<PoolListSortableColumn, { sortBy: PoolSortField; label: string }>

type ColumnSort = { id: PoolListSortableColumn; desc: boolean }
export type PoolListSorting = [ColumnSort]
type PoolListSortParams = {
  sortBy: PoolSortField
  sortDirection: PoolSortDirection
  sortField: PoolListSortableColumn
}

const SORT_OPTIONS = recordEntries(SORT_COLUMNS).map(([id, { label }]) => ({ id, label }))

const isPoolListSortColumn = (value: string | undefined): value is PoolListSortableColumn =>
  value != null && value in SORT_COLUMNS

const isColumnSort = (sort: SortingState[number]): sort is ColumnSort => isPoolListSortColumn(sort.id)

const getPoolListSorting = (sorting: SortingState, defaultSort: SortingState): PoolListSorting => {
  const sort = sorting.find(isColumnSort) ?? defaultSort.find(isColumnSort)

  return sort ? [{ id: sort.id, desc: sort.desc }] : [{ id: PoolListColumnId.Tvl, desc: true }]
}

const getPoolListSortParams = ([{ id: sortField, desc }]: PoolListSorting): PoolListSortParams => ({
  sortBy: SORT_COLUMNS[sortField].sortBy,
  // TanStack table state uses `desc`; the prices API expects `sort_direction`.
  sortDirection: desc ? 'desc' : 'asc',
  sortField,
})

/**
 * Keep sorting in TanStack's native `{ id, desc }` shape for the table and
 * `useSortFromQueryString`, then expose the prices API sort field/direction.
 */
export const usePoolListSorting = (isLite: boolean, updateQueryAndResetPage: PoolListQueryUpdater) => {
  const defaultSort = useMemo<SortingState>(() => getDefaultSort(isLite), [isLite])
  const [urlSorting] = useSortFromQueryString(defaultSort, SORT_QUERY_FIELD)
  const sorting = useMemo<PoolListSorting>(() => getPoolListSorting(urlSorting, defaultSort), [defaultSort, urlSorting])
  const { sortBy, sortDirection, sortField } = getPoolListSortParams(sorting)

  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    newSorting => {
      const nextSorting = getPoolListSorting(
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
