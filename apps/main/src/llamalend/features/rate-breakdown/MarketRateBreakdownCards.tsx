import type { ReactNode } from 'react'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { t } from '@evm-ui/lib/i18n'
import { type CurveTableFeatures, useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { MarketRateType } from '@evm-ui/types/market'
import { constQ, mapQuery, type QueryProp } from '@evm-ui/types/util'
import { formatNumber } from '@evm-ui/utils'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import type { Column } from '@tanstack/react-table'
import {
  BORROW_COLUMNS,
  MOBILE_COLUMN_VISIBILITY,
  POINTS_COLUMNS,
  SUPPLY_COLUMNS,
} from './market-rate-breakdown.columns'
import type { PointsCampaignRow, RateBreakdownData, RateBreakdownRow } from './market-rate-breakdown.utils'

const { Spacing } = SizesAndSpaces

const POINTS_CAMPAIGN_TITLES = {
  [MarketRateType.Borrow]: t`Borrow Points Campaigns`,
  [MarketRateType.Supply]: t`Supply Points Campaigns`,
} satisfies Record<MarketRateType, string>

const FooterRow = ({
  visibleColumns,
  title,
  total,
  maxBoostTotal,
}: {
  visibleColumns: Column<CurveTableFeatures, RateBreakdownRow>[]
  title: ReactNode
  total: number | null
  maxBoostTotal?: number | null
}) =>
  visibleColumns.map(({ id }) => {
    if (id === 'source')
      return (
        <TableCell key={id} sx={{ paddingInline: Spacing.md }}>
          <Typography variant="tableCellMBold">{title}</Typography>
        </TableCell>
      )
    if (id === 'price') return <TableCell key={id} />
    return (
      <TableCell key={id} sx={{ paddingInline: Spacing.md, paddingBlock: Spacing.sm, textAlign: 'right' }}>
        <Typography variant="tableCellMBold">{formatNumber(total, 'percent.rate')}</Typography>
        {maxBoostTotal != null && maxBoostTotal !== total && (
          <Typography variant="tableCellSRegular" color="textSecondary">
            {t`Max boost ${formatNumber(maxBoostTotal, 'percent.rate')}`}
          </Typography>
        )}
      </TableCell>
    )
  })

export const RateBreakdownTable = ({
  rateType,
  query,
}: {
  rateType: MarketRateType
  query: QueryProp<RateBreakdownData>
}) => {
  const isBorrow = rateType === MarketRateType.Borrow
  const table = useCurveTable({
    query: mapQuery(query, ({ rows }) => rows),
    columns: isBorrow ? BORROW_COLUMNS : SUPPLY_COLUMNS,
    state: { columnVisibility: useIsMobile() ? MOBILE_COLUMN_VISIBILITY : undefined },
  })
  const showFooter = query.data?.hasAdjustments

  return (
    <Card size="small" data-testid={`${rateType.toLowerCase()}-rate-breakdown`}>
      <CardHeader title={isBorrow ? t`Borrow Cost Breakdown` : t`Yield Breakdown`} size="small" />
      <DataTable
        category="detail"
        table={table}
        emptyState={{ title: isBorrow ? t`No borrow cost breakdown found` : t`No yield breakdown found` }}
        errorState={{ title: isBorrow ? t`Could not load borrow cost breakdown` : t`Could not load yield breakdown` }}
        footerRow={
          showFooter && (
            <FooterRow
              visibleColumns={table.getVisibleLeafColumns()}
              title={isBorrow ? t`Net Borrow APR` : t`Total APY`}
              total={query.data!.total}
              maxBoostTotal={query.data!.maxBoostTotal}
            />
          )
        }
      />
    </Card>
  )
}

export const PointsCampaignsTable = ({ rateType, rows }: { rateType: MarketRateType; rows: PointsCampaignRow[] }) => {
  const table = useCurveTable({
    query: constQ(rows),
    columns: POINTS_COLUMNS,
  })

  return (
    <Card size="small" data-testid={`${rateType.toLowerCase()}-points-campaigns`}>
      <CardHeader title={POINTS_CAMPAIGN_TITLES[rateType]} size="small" />
      <DataTable category="detail" table={table} emptyState={{ title: t`No points campaigns found` }} />
    </Card>
  )
}
