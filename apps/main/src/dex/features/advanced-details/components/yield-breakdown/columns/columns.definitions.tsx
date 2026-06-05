import Box from '@mui/material/Box'
import { maybe } from '@primitives/objects.utils'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { type TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { AddressCell } from '@ui-kit/shared/ui/DataTable/inline-cells/AddressCell'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo, type TokenInfoProps } from '@ui-kit/shared/ui/TokenInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'
import { YieldBreakdownColumnId } from './columns.enum'

export type YieldBreakdownRow = TableItem & {
  source: TokenInfoProps
  address?: string
  addressUrl?: string
  dailyApr?: number
  dailyAprSecondary?: number
  dailyAprTooltip?: string
}

const columnHelper = createColumnHelper<YieldBreakdownRow>()

const headers = {
  [YieldBreakdownColumnId.Source]: t`Source`,
  [YieldBreakdownColumnId.Address]: t`Address`,
  [YieldBreakdownColumnId.DailyApr]: t`Daily APR`,
} as const

export const YIELD_BREAKDOWN_COLUMNS = [
  columnHelper.accessor('source', {
    id: YieldBreakdownColumnId.Source,
    header: headers[YieldBreakdownColumnId.Source],
    cell: ({ getValue }) => (
      <InlineTableCell>
        <TokenInfo {...getValue()} />
      </InlineTableCell>
    ),
    enableSorting: false,
  }),
  columnHelper.accessor('address', {
    id: YieldBreakdownColumnId.Address,
    header: headers[YieldBreakdownColumnId.Address],
    cell: ({ getValue, row }) => (
      <InlineTableCell>
        {maybe(getValue(), address => (
          <AddressCell address={address} explorerUrl={row.original.addressUrl} />
        ))}
      </InlineTableCell>
    ),
    enableSorting: false,
  }),
  columnHelper.accessor('dailyApr', {
    id: YieldBreakdownColumnId.DailyApr,
    header: headers[YieldBreakdownColumnId.DailyApr],
    cell: ({ getValue, row }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <Tooltip title={row.original.dailyAprTooltip} placement="top">
          {/** Needed for tooltip to work for whatever reason */}
          <Box>
            <TokenInfo
              icon={null}
              iconPosition="right"
              primary={formatNumber(getValue(), 'percent.rate')}
              secondary={maybe(row.original.dailyAprSecondary, value => t`Base ${formatNumber(value, 'percent.rate')}`)}
            />
          </Box>
        </Tooltip>
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
]
