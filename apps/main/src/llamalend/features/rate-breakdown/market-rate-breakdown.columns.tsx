import { t } from '@evm-ui/lib/i18n'
import { Badge } from '@evm-ui/shared/ui/Badge'
import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { TokenCell } from '@evm-ui/shared/ui/DataTable/inline-cells'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo } from '@evm-ui/shared/ui/TokenInfo'
import { formatNumber } from '@evm-ui/utils'
import Typography from '@mui/material/Typography'
import type { ColumnVisibilityState } from '@tanstack/react-table'
import type { RateBreakdownRow } from './market-rate-breakdown.utils'

enum RateColumnId {
  Source = 'source',
  Price = 'price',
  Rate = 'rate',
}

const rateColumnHelper = createAppColumnHelper<RateBreakdownRow>()
const rateColumns = (rateHeader: string) =>
  rateColumnHelper.columns([
    rateColumnHelper.accessor('source', {
      id: RateColumnId.Source,
      header: t`Source`,
      cell: ({ getValue }) => {
        const { tokenInfo, address, explorerUrl, yieldBearing } = getValue()
        return (
          <TokenCell
            source={tokenInfo}
            address={address}
            explorerUrl={explorerUrl}
            endAdornment={
              yieldBearing && <Badge size="extraSmall" label={t`Yield bearing`} sx={{ alignSelf: 'flex-end' }} />
            }
          />
        )
      },
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
