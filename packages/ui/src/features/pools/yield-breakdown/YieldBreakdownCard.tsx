import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { constQ } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { DataTable } from '@ui/features/tables/DataTable'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import { YIELD_BREAKDOWN_COLUMNS, YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY } from './columns/columns.definitions'
import { FooterRow } from './FooterRow'
import type { YieldBreakdownData } from './types'

export const YieldBreakdown = ({ maxBoostTotal, total, rows }: YieldBreakdownData) => {
  const isMobile = useIsMobile()
  const table = useCurveTable({
    query: constQ(rows), // TODO: get error and loading state properly
    columns: YIELD_BREAKDOWN_COLUMNS,
    state: { columnVisibility: isMobile ? YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY : undefined },
  })

  return (
    rows.length > 0 && (
      <Card size="small">
        <CardHeader title={t`Yield Breakdown`} />
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
      </Card>
    )
  )
}
