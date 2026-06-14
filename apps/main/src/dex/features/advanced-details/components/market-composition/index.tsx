import { useMemo } from 'react'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { LegacyDataTable } from '@ui-kit/shared/ui/DataTable/LegacyDataTable'
import { useMarketComposition } from '../../hooks/useMarketComposition'
import { createMarketCompositionColumns, type MarketCompositionRow } from './columns/columns.definitions'
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
  const isMobile = useIsMobile()
  const columns = useMemo(() => createMarketCompositionColumns({ isMobile }), [isMobile])
  const table = useTable({ data: rows, columns, ...getTableOptions(rows) })

  return (
    <Stack>
      <CardHeader title={t`Market Composition`} size="small" />
      <LegacyDataTable<MarketCompositionRow>
        table={table}
        size="small"
        loading={isLoading}
        disableStickyHeader
        emptyState={<EmptyStateRow table={table} size="sm">{t`No market composition found.`}</EmptyStateRow>}
        footerRow={rows.length > 0 && <FooterRow isLoading={isLoading} totalUsd={totalUsd} />}
      />
    </Stack>
  )
}
