import { useConnection } from 'wagmi'
import { NetworkConfig } from '@/dex/types/main.types'
import Grid from '@mui/material/Grid'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LegacyPoolColumnId } from '../columns'
import type { LegacyPoolTag } from '../legacy-pools.types'

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
  ] satisfies { key: LegacyPoolTag | null; label: string }[][]

export type LegacyPoolsChipsProps = FilterProps<LegacyPoolColumnId> & {
  resultCount: number | undefined
  poolFilters: NetworkConfig['poolFilters']
}

export const LegacyPoolsChips = ({
  resultCount,
  poolFilters,
  setColumnFilter,
  columnFiltersById,
}: LegacyPoolsChipsProps) => {
  const filterKey = columnFiltersById[LegacyPoolColumnId.PoolTags] as LegacyPoolTag | undefined
  const { isConnected } = useConnection()
  return (
    <Grid
      container
      columnSpacing={Spacing.xs}
      rowSpacing={Spacing.md}
      direction="row"
      size={{ mobile: 12, desktop: 'auto' }}
      sx={{ justifyContent: 'flex-end' }}
    >
      {getFilterGroups({ isConnected }).map(group => (
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
                  toggle={() => setColumnFilter(LegacyPoolColumnId.PoolTags, filterKey === key ? null : key)}
                />
              ),
          )}
        </Grid>
      ))}
    </Grid>
  )
}
