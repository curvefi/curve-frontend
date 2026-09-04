import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { t } from '@evm-ui/lib/i18n'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { constQ } from '@ui/features/queries/util'
import { useYieldBreakdown } from '../../hooks/useYieldBreakdown'
import { YIELD_BREAKDOWN_COLUMNS, YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY } from './columns/columns.definitions'
import { FooterRow } from './FooterRow'

export const YieldBreakdown = ({
  chainId,
  poolDataCacheOrApi,
  poolId,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string
}) => {
  const isMobile = useIsMobile()
  const { maxBoostTotal, total, rows } = useYieldBreakdown({
    chainId,
    poolDataCacheOrApi,
    poolId,
  })
  const table = useCurveTable({
    query: constQ(rows), // TODO: get error and loading state properly
    columns: YIELD_BREAKDOWN_COLUMNS,
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
