import { NetworkConfig } from '@/dex/types/main.types'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PoolColumnId } from '../columns'
import type { PoolTag } from '../types'

const { Spacing } = SizesAndSpaces

const FILTER_GROUPS = [
  [
    { key: 'usd', label: 'USD' },
    { key: 'btc', label: 'BTC' },
    { key: 'kava', label: 'KAVA' },
    { key: 'eth', label: 'ETH' },
    { key: 'crvusd', label: t`crvUSD` },
    { key: 'tricrypto', label: t`Tricrypto` },
    { key: 'crypto', label: t`Crypto` },
    { key: 'stableng', label: t`Stable NG` },
    { key: 'cross-chain', label: t`Cross-chain` },
  ],
  [{ key: 'user', label: t`My Pools` }],
] satisfies { key: PoolTag | null; label: string }[][]

type PoolListFilterChipsProps = FilterProps<PoolColumnId> & {
  poolFilters: NetworkConfig['poolFilters']
}

export const PoolListFilterChips = ({ poolFilters, setColumnFilter, columnFiltersById }: PoolListFilterChipsProps) => {
  const filterKey = columnFiltersById[PoolColumnId.PoolTags] as PoolTag | undefined
  return (
    <Grid
      container
      columnSpacing={Spacing.xs}
      rowSpacing={Spacing.md}
      direction="row"
      justifyContent="flex-end"
      size={{ mobile: 12, desktop: 'auto' }}
    >
      {FILTER_GROUPS.map((group) => (
        <Grid container key={group[0].key} size={{ mobile: 12, tablet: 'auto' }} spacing={1}>
          {group.map(
            ({ key, label }) =>
              poolFilters.includes(key) && (
                <GridChip
                  size={{ mobile: 6, tablet: 'auto' }}
                  key={key}
                  data-testid={`filter-chip-${key}`}
                  label={label}
                  selected={filterKey == key}
                  toggle={() => setColumnFilter(PoolColumnId.PoolTags, filterKey === key ? undefined : key)}
                />
              ),
          )}
        </Grid>
      ))}
    </Grid>
  )
}
