import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { getRangeFilterLabel } from '@ui-kit/shared/ui/DataTable/filters'
import { TableActiveFilterChip } from '@ui-kit/shared/ui/DataTable/TableActiveFilterChip'
import { TableActiveFiltersBar } from '@ui-kit/shared/ui/DataTable/TableActiveFiltersBar'
import { emptyUrlRange } from '@ui-kit/shared/ui/DataTable/urlFilter.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { PoolListFilterProps } from '../hooks/usePoolListFilters'

const { Spacing } = SizesAndSpaces

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
  const activeFilterChips = notFalsy(
    poolTypeLabel && {
      label: `${t`Type`}: ${poolTypeLabel}`,
      toggle: () => setPoolType(null),
      testId: 'dex-pool-active-filter-type',
    },
    tvlLabel && {
      label: `${t`TVL`}: ${tvlLabel}`,
      toggle: () => setTvlRange(emptyUrlRange<number>()),
      testId: 'dex-pool-active-filter-tvl',
    },
    volumeLabel && {
      label: `${t`Volume`}: ${volumeLabel}`,
      toggle: () => setVolumeRange(emptyUrlRange<number>()),
      testId: 'dex-pool-active-filter-volume',
    },
    apyLabel && {
      label: `${t`Base vAPY`}: ${apyLabel}`,
      toggle: () => setApyRange(emptyUrlRange<number>()),
      testId: 'dex-pool-active-filter-apy',
    },
  )

  return (
    <TableActiveFiltersBar
      hasActiveFilters={hasActiveFilters}
      resetFilters={resetFilters}
      testId="dex-pool-filters-collapsible"
    >
      <Stack direction="row" sx={{ gap: Spacing.sm, flexWrap: 'wrap' }}>
        {activeFilterChips.map(chip => (
          <TableActiveFilterChip key={chip.testId} {...chip} />
        ))}
      </Stack>
    </TableActiveFiltersBar>
  )
}
