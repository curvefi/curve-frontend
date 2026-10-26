import Stack from '@mui/material/Stack'
import { getRangeFilterLabel } from '@ui/features/tables/filters'
import { TableActiveFilterGroups, type TableActiveFilterGroup } from '@ui/features/tables/TableActiveFilterGroups'
import { TableActiveFiltersBar } from '@ui/features/tables/TableActiveFiltersBar'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { PoolsChips } from '../chips/PoolsChips'
import { POOL_DEFAULT_TVL_MIN, type PoolsFiltersProps, type usePoolsFilters } from '../hooks/usePoolsFilters'
import { getPoolsTvlLabelRange, parsePoolsRangeFilter, PoolFilterId } from './utils'

const { Spacing } = SizesAndSpaces

// Show the hidden default TVL min in active range chips once a max bound is active.
const getTvlFilterLabel = (serializedRange: string | undefined) => {
  const range = parsePoolsRangeFilter(serializedRange)

  if (range[0] === POOL_DEFAULT_TVL_MIN && range[1] == null) return null

  return getRangeFilterLabel(getPoolsTvlLabelRange(range), 'dollar', { defaultMin: null })
}

type PoolsFiltersCollapsibleProps = {
  activePoolsFilter: ReturnType<typeof usePoolsFilters>['activePoolsFilter']
  hasActiveFilters: boolean
  isLite: boolean
  resetFilters: () => void
} & PoolsFiltersProps

export const PoolsFiltersCollapsible = ({
  activePoolsFilter,
  columnFiltersById,
  hasActiveFilters,
  isLite,
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
    <>
      <Stack sx={{ padding: Spacing.sm, paddingTop: 0, display: { tablet: 'none' } }}>
        <PoolsChips isLite={isLite} activePoolsFilter={activePoolsFilter} />
      </Stack>
      {!isLite && hasActiveFilters && (
        <TableActiveFiltersBar
          hasActiveFilters={hasActiveFilters}
          resetFilters={resetFilters}
          testId="dex-pool-filters-collapsible"
        >
          <TableActiveFilterGroups groups={activeFilterGroups} />
        </TableActiveFiltersBar>
      )}
    </>
  )
}
