import type { ReactNode } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import type { QueryProp } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { DataTable } from '@ui/features/tables/DataTable'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import { YIELD_BREAKDOWN_COLUMNS, YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY } from './columns/columns.definitions'
import { FooterRow } from './FooterRow'
import type { YieldBreakdownRow } from './types'

export const YieldBreakdown = ({
  maxBoostTotal,
  total,
  totalTooltip,
  rows,
}: {
  maxBoostTotal: QueryProp<number>
  total: QueryProp<number>
  totalTooltip?: ReactNode
  rows: QueryProp<YieldBreakdownRow[]>
}) => {
  const isMobile = useIsMobile()
  const table = useCurveTable({
    query: rows,
    columns: YIELD_BREAKDOWN_COLUMNS,
    state: { columnVisibility: isMobile ? YIELD_BREAKDOWN_MOBILE_COLUMN_VISIBILITY : undefined },
  })

  return (
    <Card size="small">
      <CardHeader title={t`Yield Breakdown`} />
      <DataTable
        category="detail"
        table={table}
        footerRow={
          (rows.data?.length ?? 0) > 1 && (
            <FooterRow
              visibleColumns={table.getVisibleLeafColumns()}
              maxBoostTotal={maxBoostTotal}
              total={total}
              totalTooltip={totalTooltip}
            />
          )
        }
      />
    </Card>
  )
}
