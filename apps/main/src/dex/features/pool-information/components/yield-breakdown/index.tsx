import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { t } from '@evm-ui/lib/i18n'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import { constQ } from '@evm-ui/types/util'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useYieldBreakdown } from '../../hooks/useYieldBreakdown'
import {
  YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY,
  useYieldBreakdownColumns,
} from './columns/columns.definitions'
import { FooterRow } from './FooterRow'

export const YieldBreakdown = ({
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
  const columns = useYieldBreakdownColumns()
  const { maxBoostTotal, total, rows } = useYieldBreakdown({
    chainId,
    poolDataCacheOrApi,
    poolId,
    pricesApiPoolData,
  })
  const table = useCurveTable({
    query: constQ(rows), // TODO: get error and loading state properly
    columns,
    state: { columnVisibility: isMobile ? YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY : undefined },
  })

  return (
    rows.length > 0 && (
      <Stack>
        <CardHeader title={t`Yield Breakdown`} size="small" />
        <DataTable
          category="detail"
          table={table}
          emptyState={{ title: t`No yield breakdown found` }}
          footerRow={
            rows.length > 1 && (
              <FooterRow visibleColumns={table.getVisibleLeafColumns()} maxBoostTotal={maxBoostTotal} total={total} />
            )
          }
        />
      </Stack>
    )
  )
}
