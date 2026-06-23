import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { q } from '@ui-kit/types/util'
import { usePoolComposition } from '../../hooks/usePoolComposition'
import {
  POOL_COMPOSITION_COLUMNS,
  POOL_COMPOSITION_MOBILE_COLUMN_VISIBILITY,
  type PoolCompositionRow,
} from './columns/columns.definitions'
import { FooterRow } from './FooterRow'

export const PoolComposition = ({
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
  const { isLoading, error, rows, totalUsd } = usePoolComposition({
    chainId,
    poolDataCacheOrApi,
    poolId,
    pricesApiPoolData,
  })
  const table = useTable({
    query: q({ data: rows, isLoading, error }),
    columns: POOL_COMPOSITION_COLUMNS,
    state: { columnVisibility: isMobile ? POOL_COMPOSITION_MOBILE_COLUMN_VISIBILITY : undefined },
    ...getTableOptions(rows),
  })

  return (
    <Stack>
      <CardHeader title={t`Pool Composition`} size="small" />
      <DataTable<PoolCompositionRow>
        category="detail"
        table={table}
        emptyState={{ title: t`No market composition found` }}
        footerRow={
          rows.length > 0 && (
            <FooterRow visibleColumns={table.getVisibleLeafColumns()} isLoading={isLoading} totalUsd={totalUsd} />
          )
        }
      />
    </Stack>
  )
}
