import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { DEFAULT_INCREASING_LENGTH } from '@ui-kit/hooks/useIncreasingLength'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { q } from '@ui-kit/types/util'
import { useMarketComposition } from '../../hooks/useMarketComposition'
import {
  MARKET_COMPOSITION_COLUMNS,
  MARKET_COMPOSITION_MOBILE_COLUMN_VISIBILITY,
  type MarketCompositionRow,
} from './columns/columns.definitions'
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
  const isMobile = useIsMobile()
  const { isLoading, error, rows, totalUsd } = useMarketComposition({
    chainId,
    poolDataCacheOrApi,
    poolId,
    pricesApiPoolData,
  })
  const table = useTable({
    query: q({ data: rows, isLoading, error }),
    columns: MARKET_COMPOSITION_COLUMNS,
    state: { columnVisibility: isMobile ? MARKET_COMPOSITION_MOBILE_COLUMN_VISIBILITY : undefined },
    ...getTableOptions(rows),
  })

  return (
    <Stack>
      <CardHeader title={t`Market Composition`} size="small" />
      <DataTable<MarketCompositionRow>
        table={table}
        disableStickyHeader
        increasingLengthOptions={{ ...DEFAULT_INCREASING_LENGTH, maxLength: DEFAULT_INCREASING_LENGTH.initialLength }}
        emptyState={{ size: 'sm', emptyTitle: t`No market composition found.` }}
        footerRow={
          rows.length > 0 && (
            <FooterRow visibleColumns={table.getVisibleLeafColumns()} isLoading={isLoading} totalUsd={totalUsd} />
          )
        }
      />
    </Stack>
  )
}
