import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import { createColumnHelper, type VisibilityState } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo, type TokenInfoTokenIconProps } from '@ui-kit/shared/ui/TokenInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber, formatTokenCompact } from '@ui-kit/utils'
import { TokenCell } from '../../TokenCell'
import { PoolCompositionColumnId } from './columns.enum'

export type PoolCompositionRow = TableItem & {
  source: TokenInfoTokenIconProps
  explorerUrl?: string
  marketShare?: number
  amount?: number
  amountUsd?: number
  price?: number
}

const columnHelper = createColumnHelper<PoolCompositionRow>()

const headers = {
  [PoolCompositionColumnId.Asset]: t`Asset`,
  [PoolCompositionColumnId.Price]: t`Price`,
  [PoolCompositionColumnId.Balance]: t`Balance`,
  [PoolCompositionColumnId.TokenAmount]: t`Amount`,
} as const

export const POOL_COMPOSITION_MOBILE_COLUMN_VISIBILITY = {
  [PoolCompositionColumnId.Asset]: true,
  [PoolCompositionColumnId.Price]: false,
  [PoolCompositionColumnId.Balance]: true,
  [PoolCompositionColumnId.TokenAmount]: true,
} satisfies VisibilityState

export const POOL_COMPOSITION_COLUMNS = [
  columnHelper.accessor('source', {
    id: PoolCompositionColumnId.Asset,
    header: headers[PoolCompositionColumnId.Asset],
    cell: ({ getValue, row }) => <TokenCell source={getValue()} explorerUrl={row.original.explorerUrl} />,
    enableSorting: false,
  }),
  columnHelper.accessor('price', {
    id: PoolCompositionColumnId.Price,
    header: headers[PoolCompositionColumnId.Price],
    cell: ({ getValue }) => (
      <InlineTableCell>
        <Typography>{formatNumber(getValue(), 'usd.amount')}</Typography>
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('marketShare', {
    id: PoolCompositionColumnId.Balance,
    header: headers[PoolCompositionColumnId.Balance],
    cell: ({ getValue }) => (
      <InlineTableCell>
        <Typography>{formatNumber(getValue(), 'percent.rate')}</Typography>
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('amount', {
    id: PoolCompositionColumnId.TokenAmount,
    header: headers[PoolCompositionColumnId.TokenAmount],
    cell: ({ getValue, row }) => {
      const symbol = row.original.source.primary

      return (
        <InlineTableCell sx={{ alignItems: 'end' }}>
          <Tooltip
            title={maybe(
              getValue(),
              value =>
                // TokenInfo primary is ReactNode; we only want to show a tooltip if it's a pure string (which it should for all our cases)
                typeof symbol === 'string' &&
                `${formatTokenCompact(value, symbol)} ${maybe(row.original.amountUsd, value => ` / ${value}`) ?? ''}`,
            )}
            placement="top"
          >
            {/** Needed for tooltip to work for whatever reason */}
            <Box>
              <TokenInfo
                icon={null}
                iconPosition="right"
                primary={formatNumber(getValue(), 'token.compact')}
                secondary={formatNumber(row.original.amountUsd, 'usd.notional')}
              />
            </Box>
          </Tooltip>
        </InlineTableCell>
      )
    },
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
]
