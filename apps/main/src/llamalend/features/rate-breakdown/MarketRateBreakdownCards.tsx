import type { ReactNode } from 'react'
import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import type { PointsCampaignRow } from '@evm-ui/features/points-campaigns/points-campaigns.utils'
import { PointsCampaignsTable } from '@evm-ui/features/points-campaigns/PointsCampaignsTable'
import { type CurveTableFeatures, useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import { MarketRateType } from '@evm-ui/types/market'
import Card from '@mui/material/Card'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { Column } from '@tanstack/react-table'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import { BORROW_COLUMNS, MOBILE_COLUMN_VISIBILITY, SUPPLY_COLUMNS } from './market-rate-breakdown.columns'
import type { RateBreakdownData, RateBreakdownRow } from './market-rate-breakdown.utils'

const { Spacing } = SizesAndSpaces

const POINTS_CAMPAIGN_TITLES = {
  [MarketRateType.Borrow]: t`Borrow Points Campaigns`,
  [MarketRateType.Supply]: t`Supply Points Campaigns`,
} satisfies Record<MarketRateType, string>

const RATE_BREAKDOWN_CONFIG = {
  [MarketRateType.Borrow]: {
    columns: BORROW_COLUMNS,
    title: t`Borrow Cost Breakdown`,
    emptyTitle: t`No borrow cost breakdown found`,
    errorTitle: t`Could not load borrow cost breakdown`,
    totalTitle: t`Net Borrow APR`,
  },
  [MarketRateType.Supply]: {
    columns: SUPPLY_COLUMNS,
    title: t`Yield Breakdown`,
    emptyTitle: t`No yield breakdown found`,
    errorTitle: t`Could not load yield breakdown`,
    totalTitle: t`Total APY`,
  },
}

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
  visibleColumns.map(({ id }) =>
    id === 'source' ? (
      <TableCell key={id} sx={{ paddingInline: Spacing.md }}>
        <Typography variant="tableCellMBold">{title}</Typography>
      </TableCell>
    ) : id === 'price' ? (
      <TableCell key={id} />
    ) : (
      <TableCell key={id} sx={{ paddingInline: Spacing.md, paddingBlock: Spacing.sm, textAlign: 'right' }}>
        <Typography variant="tableCellMBold">{formatNumber(total, 'percent.rate')}</Typography>
        {maxBoostTotal != null && maxBoostTotal !== total && (
          <Typography variant="tableCellSRegular" color="textSecondary">
            {t`Max boost ${formatNumber(maxBoostTotal, 'percent.rate')}`}
          </Typography>
        )}
      </TableCell>
    ),
  )

export const RateBreakdownTable = ({
  rateType,
  query,
}: {
  rateType: MarketRateType
  query: QueryProp<RateBreakdownData>
}) => {
  const { columns, title, emptyTitle, errorTitle, totalTitle } = RATE_BREAKDOWN_CONFIG[rateType]
  const table = useCurveTable({
    query: mapQuery(query, ({ rows }) => rows),
    columns,
    state: { columnVisibility: useIsMobile() ? MOBILE_COLUMN_VISIBILITY : undefined },
  })
  const showFooter = query.data?.hasAdjustments

  return (
    <Card size="small" data-testid={`${rateType.toLowerCase()}-rate-breakdown`}>
      <MarketCardHeader title={title} />
      <DataTable
        category="detail"
        table={table}
        emptyState={{ title: emptyTitle }}
        errorState={{ title: errorTitle }}
        footerRow={
          showFooter && (
            <FooterRow
              visibleColumns={table.getVisibleLeafColumns()}
              title={totalTitle}
              total={query.data!.total}
              maxBoostTotal={query.data!.maxBoostTotal}
            />
          )
        }
      />
    </Card>
  )
}

export const PointsCampaignsCard = ({ rateType, rows }: { rateType: MarketRateType; rows: PointsCampaignRow[] }) => (
  <Card size="small" data-testid={`${rateType.toLowerCase()}-points-campaigns`}>
    <MarketCardHeader title={POINTS_CAMPAIGN_TITLES[rateType]} />
    <PointsCampaignsTable rows={rows} />
  </Card>
)
