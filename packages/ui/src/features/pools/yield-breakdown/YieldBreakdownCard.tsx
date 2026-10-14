import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { toQuery } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { DataTable } from '@ui/features/tables/DataTable'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import { YIELD_BREAKDOWN_COLUMNS, YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY } from './columns/columns.definitions'
import { FooterRow } from './FooterRow'
import type { YieldBreakdownData } from './types'

export const YieldBreakdown = ({ maxBoostTotal, total, rows: rowsProp }: YieldBreakdownData) => {
  const isMobile = useIsMobile()
  const rows = toQuery(rowsProp)
  const table = useCurveTable({
    query: rows,
    columns: YIELD_BREAKDOWN_COLUMNS,
    state: { columnVisibility: isMobile ? YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY : undefined },
  })

  return (
    !!rows.data?.length && (
      <Card size="small">
        <CardHeader title={t`Yield Breakdown`} />
        <DataTable
          category="detail"
          table={table}
          footerRow={
            <FooterRow
              visibleColumns={table.getVisibleLeafColumns()}
              maxBoostTotal={toQuery(maxBoostTotal)}
              total={toQuery(total)}
            />
          }
        />
      </Card>
    )
  )
}
