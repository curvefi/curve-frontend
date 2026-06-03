import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { type TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { AddressCell } from '@ui-kit/shared/ui/DataTable/inline-cells/AddressCell'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo, type TokenInfoProps } from '@ui-kit/shared/ui/TokenInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatPercent } from '@ui-kit/utils'
import { YieldBreakdownColumnId } from './columns.enum'

export type YieldBreakdownRow = TableItem & {
  source: TokenInfoProps
  address?: string
  addressUrl?: string
  dailyApr?: number
  dailyAprSecondary?: number
  dailyAprTooltip?: string
  points?: string
}

const columnHelper = createColumnHelper<YieldBreakdownRow>()

const headers = {
  [YieldBreakdownColumnId.Source]: t`Source`,
  [YieldBreakdownColumnId.Address]: t`Address`,
  [YieldBreakdownColumnId.DailyApr]: t`Daily APR`,
  [YieldBreakdownColumnId.Points]: t`Points`,
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
        {maybe(getValue(), dailyApr => (
          <Tooltip title={row.original.dailyAprTooltip} placement="top">
            {/** Needed for tooltip to work for whatever reason */}
            <Box>
              <TokenInfo
                icon={null}
                iconPosition="right"
                primary={formatPercent(dailyApr)}
                secondary={maybe(row.original.dailyAprSecondary, value => t`Base ${formatPercent(value)}`)}
              />
            </Box>
          </Tooltip>
        ))}
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
]

const pointsColumn = columnHelper.accessor('points', {
  id: YieldBreakdownColumnId.Points,
  header: headers[YieldBreakdownColumnId.Points],
  cell: ({ getValue }) => (
    <InlineTableCell>{getValue() && <Typography variant="tableCellMRegular">{getValue()}</Typography>}</InlineTableCell>
  ),
  enableSorting: false,
  meta: { type: 'numeric' },
})

export const createYieldBreakdownColumns = ({ showPointsMultiplier }: { showPointsMultiplier: boolean }) =>
  notFalsy(...YIELD_BREAKDOWN_COLUMNS, showPointsMultiplier && pointsColumn)
