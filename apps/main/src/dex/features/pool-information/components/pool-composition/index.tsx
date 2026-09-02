import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { t } from '@evm-ui/lib/i18n'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import type { QueryProp } from '@evm-ui/types/util'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { usePoolComposition } from '../../hooks/usePoolComposition'
import { POOL_COMPOSITION_COLUMNS, POOL_COMPOSITION_MOBILE_COLUMN_VISIBILITY } from './columns/columns.definitions'
import { FooterRow } from './FooterRow'

export const PoolComposition = ({
  chainId,
  poolQuery,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
  pricesApiPoolData?: PricesApiPool
}) => {
  const isMobile = useIsMobile()
  const { isLoading, query, rows, totalUsd } = usePoolComposition({
    chainId,
    poolQuery,
    pricesApiPoolData,
  })
  const table = useCurveTable({
    query,
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
          !poolQuery.isLoading &&
          rows &&
          totalUsd &&
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
