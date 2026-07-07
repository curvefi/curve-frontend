import { t } from '@ui-kit/lib/i18n'
import { getRangeFilterLabel } from '@ui-kit/shared/ui/DataTable/filters'
import {
  TableActiveFilterGroups,
  type TableActiveFilterGroup,
} from '@ui-kit/shared/ui/DataTable/TableActiveFilterGroups'
import { TableActiveFiltersBar } from '@ui-kit/shared/ui/DataTable/TableActiveFiltersBar'
import { POOL_LIST_DEFAULT_TVL_MIN, type PoolListFilterProps } from '../hooks/usePoolListFilters'
import { getPoolListTvlLabelRange, parsePoolListRangeFilter, PoolListFilterId } from '../poolListFilterQuery'

// Show the hidden default TVL min in active range chips once a max bound is active.
const getTvlFilterLabel = (serializedRange: string | undefined) => {
  const range = parsePoolListRangeFilter(serializedRange)

  if (range[0] === POOL_LIST_DEFAULT_TVL_MIN && range[1] == null) return null

  return getRangeFilterLabel(getPoolListTvlLabelRange(range), 'dollar', {
    defaultMin: null,
  })
}

type PoolListFiltersCollapsibleProps = {
  hasActiveFilters: boolean
  resetFilters: () => void
} & PoolListFilterProps

export const PoolListFiltersCollapsible = ({
  columnFiltersById,
  hasActiveFilters,
  poolTypeFilters,
  resetFilters,
  setColumnFilter,
}: PoolListFiltersCollapsibleProps) => {
  const poolType = columnFiltersById[PoolListFilterId.PoolType]
  const poolTypeLabel = poolTypeFilters.find(({ key }) => key === poolType)?.label ?? poolType
  const tvlLabel = getTvlFilterLabel(columnFiltersById[PoolListFilterId.Tvl])
  const volumeLabel = getRangeFilterLabel(
    parsePoolListRangeFilter(columnFiltersById[PoolListFilterId.Volume]),
    'dollar',
  )
  const apyLabel = getRangeFilterLabel(
    parsePoolListRangeFilter(columnFiltersById[PoolListFilterId.Apy]),
    'percentage',
    {
      defaultMin: null,
    },
  )
  const activeFilterGroups: TableActiveFilterGroup[] = [
    {
      key: 'pool-type',
      labels: poolTypeLabel ? [poolTypeLabel] : null,
      onRemove: () => setColumnFilter(PoolListFilterId.PoolType, null),
      title: t`Type`,
      getChipTestId: () => 'dex-pool-active-filter-type',
    },
    {
      key: 'tvl',
      labels: tvlLabel ? [tvlLabel] : null,
      onRemove: () => setColumnFilter(PoolListFilterId.Tvl, null),
      title: t`TVL`,
      getChipTestId: () => 'dex-pool-active-filter-tvl',
    },
    {
      key: 'volume',
      labels: volumeLabel ? [volumeLabel] : null,
      onRemove: () => setColumnFilter(PoolListFilterId.Volume, null),
      title: t`Volume`,
      getChipTestId: () => 'dex-pool-active-filter-volume',
    },
    {
      key: 'apy',
      labels: apyLabel ? [apyLabel] : null,
      onRemove: () => setColumnFilter(PoolListFilterId.Apy, null),
      title: t`Base vAPY`,
      getChipTestId: () => 'dex-pool-active-filter-apy',
    },
  ]

  return (
    <TableActiveFiltersBar
      hasActiveFilters={hasActiveFilters}
      resetFilters={resetFilters}
      testId="dex-pool-filters-collapsible"
    >
      <TableActiveFilterGroups groups={activeFilterGroups} />
    </TableActiveFiltersBar>
  )
}
