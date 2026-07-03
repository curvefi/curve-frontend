import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { getRangeFilterLabel } from '@ui-kit/shared/ui/DataTable/filters'
import { TableActiveFilterChip } from '@ui-kit/shared/ui/DataTable/TableActiveFilterChip'
import { TableActiveFilterGroups } from '@ui-kit/shared/ui/DataTable/TableActiveFilterGroups'
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
  const activeFilterGroups = notFalsy(
    poolTypeLabel && {
      chips: (
        <TableActiveFilterChip
          label={poolTypeLabel}
          toggle={() => setColumnFilter(PoolListFilterId.PoolType, null)}
          testId="dex-pool-active-filter-type"
        />
      ),
      key: 'pool-type',
      title: t`Type`,
    },
    tvlLabel && {
      chips: (
        <TableActiveFilterChip
          label={tvlLabel}
          toggle={() => setColumnFilter(PoolListFilterId.Tvl, null)}
          testId="dex-pool-active-filter-tvl"
        />
      ),
      key: 'tvl',
      title: t`TVL`,
    },
    volumeLabel && {
      chips: (
        <TableActiveFilterChip
          label={volumeLabel}
          toggle={() => setColumnFilter(PoolListFilterId.Volume, null)}
          testId="dex-pool-active-filter-volume"
        />
      ),
      key: 'volume',
      title: t`Volume`,
    },
    apyLabel && {
      chips: (
        <TableActiveFilterChip
          label={apyLabel}
          toggle={() => setColumnFilter(PoolListFilterId.Apy, null)}
          testId="dex-pool-active-filter-apy"
        />
      ),
      key: 'apy',
      title: t`Base vAPY`,
    },
  )

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
