import { t } from '@ui-kit/lib/i18n'
import { getRangeFilterLabel } from '@ui-kit/shared/ui/DataTable/filters'
import {
  TableActiveFilterGroups,
  type TableActiveFilterGroup,
} from '@ui-kit/shared/ui/DataTable/TableActiveFilterGroups'
import { TableActiveFiltersBar } from '@ui-kit/shared/ui/DataTable/TableActiveFiltersBar'
import { POOL_DEFAULT_TVL_MIN, type PoolsFiltersProps } from '../hooks/usePoolsFilters'
import { getPoolsTvlLabelRange, parsePoolsRangeFilter, PoolFilterId } from './utils'

// Show the hidden default TVL min in active range chips once a max bound is active.
const getTvlFilterLabel = (serializedRange: string | undefined) => {
  const range = parsePoolsRangeFilter(serializedRange)

  if (range[0] === POOL_DEFAULT_TVL_MIN && range[1] == null) return null

  return getRangeFilterLabel(getPoolsTvlLabelRange(range), 'dollar', { defaultMin: null })
}

type PoolsFiltersCollapsibleProps = {
  hasActiveFilters: boolean
  resetFilters: () => void
} & PoolsFiltersProps

export const PoolsFiltersCollapsible = ({
  columnFiltersById,
  hasActiveFilters,
  poolTypeFilters,
  resetFilters,
  setColumnFilter,
}: PoolsFiltersCollapsibleProps) => {
  const poolType = columnFiltersById[PoolFilterId.PoolType]
  const poolTypeLabel = poolTypeFilters.find(({ key }) => key === poolType)?.label ?? poolType
  const tvlLabel = getTvlFilterLabel(columnFiltersById[PoolFilterId.Tvl])
  const volumeLabel = getRangeFilterLabel(parsePoolsRangeFilter(columnFiltersById[PoolFilterId.Volume]), 'dollar')
  const apyLabel = getRangeFilterLabel(parsePoolsRangeFilter(columnFiltersById[PoolFilterId.Apy]), 'percentage', {
    defaultMin: null,
  })
  const activeFilterGroups: TableActiveFilterGroup[] = [
    {
      key: 'pool-type',
      labels: poolTypeLabel ? [poolTypeLabel] : null,
      onRemove: () => setColumnFilter(PoolFilterId.PoolType, null),
      title: t`Type`,
      getChipTestId: () => 'dex-pool-active-filter-type',
    },
    {
      key: 'tvl',
      labels: tvlLabel ? [tvlLabel] : null,
      onRemove: () => setColumnFilter(PoolFilterId.Tvl, null),
      title: t`TVL`,
      getChipTestId: () => 'dex-pool-active-filter-tvl',
    },
    {
      key: 'volume',
      labels: volumeLabel ? [volumeLabel] : null,
      onRemove: () => setColumnFilter(PoolFilterId.Volume, null),
      title: t`Volume`,
      getChipTestId: () => 'dex-pool-active-filter-volume',
    },
    {
      key: 'apy',
      labels: apyLabel ? [apyLabel] : null,
      onRemove: () => setColumnFilter(PoolFilterId.Apy, null),
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
