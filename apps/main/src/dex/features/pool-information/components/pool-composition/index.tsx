import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { t } from '@evm-ui/lib/i18n'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import { q } from '@evm-ui/types/util'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { usePoolComposition } from '../../hooks/usePoolComposition'
import { POOL_COMPOSITION_COLUMNS, POOL_COMPOSITION_MOBILE_COLUMN_VISIBILITY } from './columns/columns.definitions'
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
  const table = useCurveTable({
    query: q({ data: rows, isLoading, error }),
    columns: POOL_COMPOSITION_COLUMNS,
    state: { columnVisibility: isMobile ? POOL_COMPOSITION_MOBILE_COLUMN_VISIBILITY : undefined },
  })

  return (
    <Stack>
      <CardHeader title={t`Composition`} size="small" />
      <DataTable
        category="detail"
        table={table}
        emptyState={{ title: t`No market composition found` }}
        footerRow={
          rows.length > 0 && (
            <FooterRow
              visibleColumns={table.getVisibleLeafColumns()}
              isLoading={isLoading}
              totalUsd={totalUsd}
              hasBalance={rows.some(row => row.amount)}
            />
          )
        }
      />
    </Stack>
  )
}
