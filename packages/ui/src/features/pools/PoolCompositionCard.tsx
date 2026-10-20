import type { ReactNode } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import type { Decimal } from '@primitives/decimal.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { DataTable } from '@ui/features/tables/DataTable'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import {
  POOL_COMPOSITION_COLUMNS,
  POOL_COMPOSITION_MOBILE_COLUMN_VISIBILITY,
  type PoolCompositionRow,
} from './pool-composition/columns/columns.definitions'
import { FooterRow } from './pool-composition/FooterRow'
import { PoolCompositionChart } from './pool-composition/PoolCompositionChart'

const { Height } = SizesAndSpaces

/** Chain-neutral pool composition presentation. Apps map their data sources into rows. */
export const PoolCompositionCard = ({
  rows,
  totalUsd,
  children,
}: {
  rows: QueryProp<PoolCompositionRow[]>
  totalUsd: QueryProp<Decimal>
  children?: ReactNode
}) => {
  const isMobile = useIsMobile()
  const table = useCurveTable({
    query: rows,
    columns: POOL_COMPOSITION_COLUMNS,
    state: { columnVisibility: isMobile ? POOL_COMPOSITION_MOBILE_COLUMN_VISIBILITY : undefined },
  })

  return (
    <Card size="small">
      <Grid container sx={{ backgroundColor: theme => theme.design.Layer[1].Fill }}>
        <Grid size={{ mobile: 12, desktop: 8 }} sx={{ minWidth: 0 }} data-testid="pool-composition-table">
          <CardHeader title={t`Pool Composition`} />
          <DataTable
            category="detail"
            table={table}
            emptyState={{ title: t`No market composition found` }}
            footerRow={
              !!rows.data?.length && (
                <FooterRow
                  visibleColumns={table.getVisibleLeafColumns()}
                  totalUsd={totalUsd}
                  hasBalance={mapQuery(rows, data => data.some(r => r.marketShare.data && +r.marketShare.data))}
                />
              )
            }
          />
        </Grid>
        <Grid
          size={{ mobile: 12, desktop: 4 }}
          sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}
          data-testid="pool-composition-reserves"
        >
          <CardHeader title={t`Reserves`} />
          <CardContent
            size="small"
            sx={{ display: 'flex', flexGrow: 1, minHeight: 0, height: { mobile: Height.chart.sm, desktop: 'auto' } }}
          >
            <PoolCompositionChart rows={rows} />
          </CardContent>
        </Grid>
      </Grid>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  )
}
