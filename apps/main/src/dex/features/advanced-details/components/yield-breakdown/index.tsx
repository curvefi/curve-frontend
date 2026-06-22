import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { constQ } from '@ui-kit/types/util'
import { useYieldBreakdown } from '../../hooks/useYieldBreakdown'
import {
  YIELD_BREAKDOWN_COLUMNS,
  YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY,
  type YieldBreakdownRow,
} from './columns/columns.definitions'
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
  const { baseTotal, total, rows } = useYieldBreakdown({
    chainId,
    poolDataCacheOrApi,
    poolId,
  })
  const table = useTable({
    query: constQ(rows), // TODO: get error and loading state properly
    columns: YIELD_BREAKDOWN_COLUMNS,
    state: { columnVisibility: isMobile ? YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY : undefined },
    ...getTableOptions(rows),
  })

  return (
    rows.length > 0 &&
    total > 0 && (
      <Stack>
        <CardHeader title={t`Yield Breakdown`} size="small" />
        <DataTable<YieldBreakdownRow>
          table={table}
          disableStickyHeader
          emptyState={{ size: 'sm', emptyTitle: t`No yield breakdown found.` }}
          footerRow={
            rows.length > 1 && (
              <FooterRow visibleColumns={table.getVisibleLeafColumns()} baseTotal={baseTotal} total={total} />
            )
          }
        />
      </Stack>
    )
  )
}
