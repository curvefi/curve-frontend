import { t } from '@evm-ui/lib/i18n'
import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { ExternalLink } from '@evm-ui/shared/ui/ExternalLink'
import { TokenInfo } from '@evm-ui/shared/ui/TokenInfo'
import { formatNumber } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ColumnVisibilityState } from '@tanstack/react-table'
import type { PointsCampaignRow, RateBreakdownRow } from './market-rate-breakdown.utils'
import { RateBreakdownSourceCell } from './RateBreakdownSourceCell'

enum RateColumnId {
  Source = 'source',
  Price = 'price',
  Rate = 'rate',
}

enum PointsColumnId {
  Source = 'source',
  Multiplier = 'multiplier',
  CampaignUrl = 'campaignUrl',
}

const rateColumnHelper = createAppColumnHelper<RateBreakdownRow>()
const rateColumns = (rateHeader: string) =>
  rateColumnHelper.columns([
    rateColumnHelper.accessor('source', {
      id: RateColumnId.Source,
      header: t`Source`,
      cell: ({ getValue }) => <RateBreakdownSourceCell source={getValue()} />,
      enableSorting: false,
    }),
    rateColumnHelper.accessor('price', {
      id: RateColumnId.Price,
      header: t`Price`,
      cell: ({ getValue }) => (
        <InlineTableCell>
          <Typography>{formatNumber(getValue(), 'usd.precise')}</Typography>
        </InlineTableCell>
      ),
      enableSorting: false,
      meta: { type: 'numeric' },
    }),
    rateColumnHelper.accessor('rate', {
      id: RateColumnId.Rate,
      header: rateHeader,
      cell: ({ getValue, row }) => (
        <InlineTableCell sx={{ alignItems: 'end' }}>
          <TokenInfo
            icon={null}
            iconPosition="right"
            primary={formatNumber(getValue(), 'percent.rate')}
            secondary={
              row.original.maxBoostRate != null && row.original.maxBoostRate !== getValue()
                ? t`Max boost ${formatNumber(row.original.maxBoostRate, 'percent.rate')}`
                : undefined
            }
          />
        </InlineTableCell>
      ),
      enableSorting: false,
      meta: { type: 'numeric' },
    }),
  ])

export const BORROW_COLUMNS = rateColumns(t`APR`)
export const SUPPLY_COLUMNS = rateColumns(t`APY`)
export const MOBILE_COLUMN_VISIBILITY = {
  [RateColumnId.Source]: true,
  [RateColumnId.Price]: false,
  [RateColumnId.Rate]: true,
} satisfies ColumnVisibilityState

const pointsColumnHelper = createAppColumnHelper<PointsCampaignRow>()
export const POINTS_COLUMNS = pointsColumnHelper.columns([
  pointsColumnHelper.accessor('source', {
    id: PointsColumnId.Source,
    header: t`Source`,
    cell: ({ getValue }) => (
      <InlineTableCell>
        <TokenInfo {...getValue()} boldPrimary />
      </InlineTableCell>
    ),
    enableSorting: false,
  }),
  pointsColumnHelper.accessor('multiplier', {
    id: PointsColumnId.Multiplier,
    header: t`Multiplier`,
    cell: ({ getValue }) => (
      <InlineTableCell>
        <Typography>{getValue()}</Typography>
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  pointsColumnHelper.accessor('campaignUrl', {
    id: PointsColumnId.CampaignUrl,
    header: t`Details`,
    cell: ({ getValue }) => (
      <InlineTableCell>
        <ExternalLink
          href={getValue()}
          label={<Box component="span" sx={{ display: { mobile: 'none', tablet: 'inline' } }}>{t`To campaign`}</Box>}
          sx={{ justifyContent: 'end' }}
        />
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
])
