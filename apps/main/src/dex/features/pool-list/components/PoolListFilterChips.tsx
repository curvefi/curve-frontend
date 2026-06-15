import Grid from '@mui/material/Grid'
import { notFalsy } from '@primitives/objects.utils'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { PoolListPoolType } from '../hooks/usePoolListUrlState'

const { Spacing } = SizesAndSpaces

type PoolListFilterChip = { key: PoolListPoolType; label: string }

export type PoolListFilterChipsProps = {
  poolType: PoolListPoolType | undefined
  poolTypeFilters: readonly PoolListFilterChip[]
  resultCount: number | undefined
  setPoolType: (poolType: PoolListPoolType | null) => void
}

export const PoolListFilterChips = ({
  poolType,
  poolTypeFilters,
  resultCount,
  setPoolType,
}: PoolListFilterChipsProps) => (
  <Grid
    container
    columnSpacing={Spacing.xs}
    rowSpacing={Spacing.md}
    direction="row"
    size={{ mobile: 12, desktop: 'auto' }}
    sx={{ justifyContent: 'flex-end' }}
  >
    <Grid container size={{ mobile: 12, tablet: 'auto' }} spacing={1}>
      {poolTypeFilters.map(({ key, label }) => (
        <GridChip
          size={{ mobile: 6, tablet: 'auto' }}
          key={key}
          data-testid={`filter-chip-${key}`}
          label={notFalsy(label, poolType === key && resultCount != null && ` (${resultCount})`).join(' ')}
          selected={poolType === key}
          toggle={() => setPoolType(poolType === key ? null : key)}
        />
      ))}
    </Grid>
  </Grid>
)
