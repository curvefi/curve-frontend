import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { t } from '@evm-ui/lib/i18n'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import type { QueryProp } from '@evm-ui/types/util'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useYieldBreakdown, type YieldBreakdownResult } from '../../hooks/useYieldBreakdown'
import { YIELD_BREAKDOWN_COLUMNS, YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY } from './columns/columns.definitions'
import { FooterRow } from './FooterRow'

export const YieldBreakdown = ({
  chainId,
  poolQuery,
}: {
  chainId: ChainId
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
}) => {
  const isMobile = useIsMobile()
  const { maxBoostTotal, query, total, rows }: YieldBreakdownResult = useYieldBreakdown({
    chainId,
    poolQuery,
  })
  const table = useCurveTable({
    query,
    columns: YIELD_BREAKDOWN_COLUMNS,
    state: { columnVisibility: isMobile ? YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY : undefined },
  })

  return (
    (poolQuery.isLoading || rows.length > 0) && (
      <Stack>
        <CardHeader title={t`Yield Breakdown`} size="small" />
        <DataTable
          category="detail"
          table={table}
          emptyState={{ title: t`No yield breakdown found` }}
          footerRow={
            !poolQuery.isLoading &&
            rows.length > 1 && (
              <FooterRow visibleColumns={table.getVisibleLeafColumns()} maxBoostTotal={maxBoostTotal} total={total} />
            )
          }
        />
      </Stack>
    )
  )
}
