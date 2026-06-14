import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo, type TokenInfoProps } from '@ui-kit/shared/ui/TokenInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'
import { TokenCell } from '../../TokenCell'
import { YieldBreakdownColumnId } from './columns.enum'

export type YieldBreakdownRow = TableItem & {
  source: TokenInfoProps
  address?: string
  explorerUrl?: string
  price?: number
  apy?: number
  apySecondary?: number
  apyTooltip?: string
}

const columnHelper = createColumnHelper<YieldBreakdownRow>()

const headers = {
  [YieldBreakdownColumnId.Source]: t`Source`,
  [YieldBreakdownColumnId.Price]: t`Price`,
  [YieldBreakdownColumnId.Apy]: t`APY`,
} as const

export const createYieldBreakdownColumns = ({ isMobile }: { isMobile: boolean }) => [
  columnHelper.accessor('source', {
    id: YieldBreakdownColumnId.Source,
    header: headers[YieldBreakdownColumnId.Source],
    cell: ({ getValue, row }) => (
      <TokenCell source={getValue()} address={row.original.address} explorerUrl={row.original.explorerUrl} />
    ),
    enableSorting: false,
  }),
  ...(isMobile
    ? []
    : [
        columnHelper.accessor('price', {
          id: YieldBreakdownColumnId.Price,
          header: headers[YieldBreakdownColumnId.Price],
          cell: ({ getValue }) => (
            <InlineTableCell>
              <Typography>{formatNumber(getValue(), 'usd.amount')}</Typography>
            </InlineTableCell>
          ),
          enableSorting: false,
          meta: { type: 'numeric' },
        }),
      ]),
  columnHelper.accessor('apy', {
    id: YieldBreakdownColumnId.Apy,
    header: headers[YieldBreakdownColumnId.Apy],
    cell: ({ getValue, row }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <Tooltip title={row.original.apyTooltip} placement="top">
          {/** Needed for tooltip to work for whatever reason */}
          <Box>
            <TokenInfo
              icon={null}
              iconPosition="right"
              primary={formatNumber(getValue(), 'percent.rate')}
              secondary={maybe(row.original.apySecondary, value => t`Base ${formatNumber(value, 'percent.rate')}`)}
            />
          </Box>
        </Tooltip>
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
]
