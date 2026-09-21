import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { q } from '@ui/features/queries/util'
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
  isLoading,
  error,
}: {
  rows: PoolCompositionRow[]
  totalUsd: string | undefined
  isLoading: boolean
  error: Error | null
}) => {
  const isMobile = useIsMobile()
  const table = useCurveTable({
    query: q({ data: rows, isLoading, error }),
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
    </Card>
  )
}
