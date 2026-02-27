import { useConnection } from 'wagmi'
import { NetworkConfig } from '@/dex/types/main.types'
import Grid from '@mui/material/Grid'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PoolColumnId } from '../columns'
import type { PoolTag } from '../types'

const { Spacing } = SizesAndSpaces

const getFilterGroups = ({ isConnected }: { isConnected: boolean }) =>
  [
    [
      { key: 'usd' as const, label: 'USD' },
      { key: 'btc' as const, label: 'BTC' },
      { key: 'kava' as const, label: 'KAVA' },
      { key: 'eth' as const, label: 'ETH' },
      { key: 'crvusd' as const, label: t`crvUSD` },
      { key: 'tricrypto' as const, label: t`Tricrypto` },
      { key: 'crypto' as const, label: t`Crypto` },
      { key: 'stableng' as const, label: t`Stable NG` },
      { key: 'cross-chain' as const, label: t`Cross-chain` },
    ],
    ...(isConnected ? [[{ key: 'user' as const, label: t`My Pools` }]] : []),
  ] satisfies { key: PoolTag | null; label: string }[][]

export type PoolListFilterChipsProps = FilterProps<PoolColumnId> & {
  resultCount: number | undefined
  poolFilters: NetworkConfig['poolFilters']
}

export const PoolListFilterChips = ({
  resultCount,
  poolFilters,
  setColumnFilter,
  columnFiltersById,
}: PoolListFilterChipsProps) => {
  const filterKey = columnFiltersById[PoolColumnId.PoolTags] as PoolTag | undefined
  const { isConnected } = useConnection()
  return (
    <Grid
      container
      columnSpacing={Spacing.xs}
      rowSpacing={Spacing.md}
      direction="row"
      justifyContent="flex-end"
      size={{ mobile: 12, desktop: 'auto' }}
    >
      {getFilterGroups({ isConnected }).map((group) => (
        <Grid container key={group[0].key} size={{ mobile: 12, tablet: 'auto' }} spacing={1}>
          {group.map(
            ({ key, label }) =>
              poolFilters.includes(key) && (
                <GridChip
                  size={{ mobile: 6, tablet: 'auto' }}
                  key={key}
                  data-testid={`filter-chip-${key}`}
                  label={notFalsy(label, filterKey == key && resultCount != null && ` (${resultCount})`).join(' ')}
                  selected={filterKey == key}
                  toggle={() => setColumnFilter(PoolColumnId.PoolTags, filterKey === key ? null : key)}
                />
              ),
          )}
        </Grid>
      ))}
    </Grid>
  )
}
