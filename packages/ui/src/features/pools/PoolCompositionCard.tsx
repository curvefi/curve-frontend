import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import type { Decimal } from '@primitives/decimal.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { DataTable } from '@ui/features/tables/DataTable'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import {
  POOL_COMPOSITION_COLUMNS,
  POOL_COMPOSITION_MOBILE_COLUMN_VISIBILITY,
  type PoolCompositionRow,
} from './pool-composition/columns/columns.definitions'
import { FooterRow } from './pool-composition/FooterRow'

/** Chain-neutral pool composition presentation. Apps map their data sources into rows. */
export const PoolCompositionCard = ({
  rows,
  totalUsd,
}: {
  rows: QueryProp<PoolCompositionRow[]>
  totalUsd: QueryProp<Decimal>
}) => {
  const isMobile = useIsMobile()
  const table = useCurveTable({
    query: rows,
    columns: POOL_COMPOSITION_COLUMNS,
    state: { columnVisibility: isMobile ? POOL_COMPOSITION_MOBILE_COLUMN_VISIBILITY : undefined },
  })

  return (
    <Card size="small">
      <CardHeader title={t`Composition`} />
      <DataTable
        category="detail"
        table={table}
        emptyState={{ title: t`No market composition found` }}
        footerRow={
          !!rows.data?.length && (
            <FooterRow
              visibleColumns={table.getVisibleLeafColumns()}
              totalUsd={totalUsd}
              hasBalance={mapQuery(rows, data => data.some(r => r.marketShare && +r.marketShare))}
            />
          )
        }
      />
    </Card>
  )
}
