import { useMemo } from 'react'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { DEFAULT_INCREASING_LENGTH } from '@ui-kit/hooks/useIncreasingLength'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
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
      <DataTable<MarketCompositionRow>
        table={table}
        isLoading={isLoading}
        disableStickyHeader
        increasingLengthOptions={{ ...DEFAULT_INCREASING_LENGTH, maxLength: DEFAULT_INCREASING_LENGTH.initialLength }}
        emptyState={<EmptyStateRow table={table} size="sm">{t`No market composition found.`}</EmptyStateRow>}
        footerRow={
          rows.length > 0 && (
            <FooterRow visibleColumns={table.getVisibleLeafColumns()} isLoading={isLoading} totalUsd={totalUsd} />
          )
        }
      />
    </Stack>
  )
}
