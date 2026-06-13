import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { DEFAULT_INCREASING_LENGTH } from '@ui-kit/hooks/useIncreasingLength'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { useMarketComposition } from '../../hooks/useMarketComposition'
import { MARKET_COMPOSITION_COLUMNS, type MarketCompositionRow } from './columns/columns.definitions'
import { FooterRow } from './FooterRow'

export const MarketComposition = ({
  chainId,
  poolDataCacheOrApi,
  poolId,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string
  pricesApiPoolData?: PricesApiPool
}) => {
  const { isLoading, rows, totalUsd } = useMarketComposition({
    chainId,
    poolDataCacheOrApi,
    poolId,
    pricesApiPoolData,
  })
  const table = useTable({
    data: rows,
    columns: MARKET_COMPOSITION_COLUMNS,
    ...getTableOptions(rows),
  })

  return (
    <Stack>
      <CardHeader title={t`Market Composition`} size="small" />
      <DataTable<MarketCompositionRow>
        table={table}
        size="small"
        isLoading={isLoading}
        disableStickyHeader
        increasingLengthOptions={{ ...DEFAULT_INCREASING_LENGTH, maxLength: DEFAULT_INCREASING_LENGTH.initialLength }}
        emptyState={<EmptyStateRow table={table} size="sm">{t`No market composition found.`}</EmptyStateRow>}
        footerRow={rows.length > 0 && <FooterRow isLoading={isLoading} totalUsd={totalUsd} />}
      />
    </Stack>
  )
}
