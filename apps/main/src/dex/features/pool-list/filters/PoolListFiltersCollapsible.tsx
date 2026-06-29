import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { getRangeFilterLabel } from '@ui-kit/shared/ui/DataTable/filters'
import { TableActiveFilterChip } from '@ui-kit/shared/ui/DataTable/TableActiveFilterChip'
import { TableActiveFilterGroups } from '@ui-kit/shared/ui/DataTable/TableActiveFilterGroups'
import { TableActiveFiltersBar } from '@ui-kit/shared/ui/DataTable/TableActiveFiltersBar'
import { emptyUrlRange } from '@ui-kit/shared/ui/DataTable/urlFilter.utils'
import type { PoolListFilterProps } from '../hooks/usePoolListFilters'

type PoolListFiltersCollapsibleProps = {
  hasActiveFilters: boolean
  resetFilters: () => void
} & PoolListFilterProps

export const PoolListFiltersCollapsible = ({
  apyRange,
  hasActiveFilters,
  poolType,
  poolTypeFilters,
  resetFilters,
  setApyRange,
  setPoolType,
  setTvlRange,
  setVolumeRange,
  tvlRange,
  volumeRange,
}: PoolListFiltersCollapsibleProps) => {
  const poolTypeLabel = poolTypeFilters.find(({ key }) => key === poolType)?.label
  const tvlLabel = getRangeFilterLabel(tvlRange, 'dollar')
  const volumeLabel = getRangeFilterLabel(volumeRange, 'dollar')
  const apyLabel = getRangeFilterLabel(apyRange, 'percentage', { defaultMin: null })
  const activeFilterGroups = notFalsy(
    poolTypeLabel && {
      chips: (
        <TableActiveFilterChip
          label={poolTypeLabel}
          toggle={() => setPoolType(null)}
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
          toggle={() => setTvlRange(emptyUrlRange<number>())}
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
          toggle={() => setVolumeRange(emptyUrlRange<number>())}
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
          toggle={() => setApyRange(emptyUrlRange<number>())}
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
