import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo, type TokenInfoTokenIconProps } from '@ui-kit/shared/ui/TokenInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'
import { TokenCell } from '../../TokenCell'
import { MarketCompositionColumnId } from './columns.enum'

type MarketCompositionSource = TokenInfoTokenIconProps & {
  primary: string
}

export type MarketCompositionRow = TableItem & {
  source: MarketCompositionSource
  marketShare?: number
  amount?: number
  amountUsd?: number
  price?: number
}

const columnHelper = createColumnHelper<MarketCompositionRow>()

const headers = {
  [MarketCompositionColumnId.Asset]: t`Asset`,
  [MarketCompositionColumnId.Price]: t`Price`,
  [MarketCompositionColumnId.MarketShare]: t`% of Market`,
  [MarketCompositionColumnId.TokenAmount]: t`Amount`,
} as const

export const MARKET_COMPOSITION_COLUMNS = [
  columnHelper.accessor('source', {
    id: MarketCompositionColumnId.Asset,
    header: headers[MarketCompositionColumnId.Asset],
    cell: ({ getValue }) => <TokenCell source={getValue()} />,
    enableSorting: false,
  }),
  columnHelper.accessor('price', {
    id: MarketCompositionColumnId.Price,
    header: headers[MarketCompositionColumnId.Price],
    cell: ({ getValue }) => (
      <InlineTableCell>
        <Typography variant="tableCellMRegular">{formatNumber(getValue(), 'usd.amount')}</Typography>
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('marketShare', {
    id: MarketCompositionColumnId.MarketShare,
    header: headers[MarketCompositionColumnId.MarketShare],
    cell: ({ getValue }) => (
      <InlineTableCell>
        <Typography variant="tableCellMRegular">{formatNumber(getValue(), 'percent.rate')}</Typography>
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('amount', {
    id: MarketCompositionColumnId.TokenAmount,
    header: headers[MarketCompositionColumnId.TokenAmount],
    cell: ({ getValue, row }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <Tooltip
          title={maybe(
            getValue(),
            value =>
              !isNaN(value) &&
              `${value} ${row.original.source.primary} ${maybe(row.original.amountUsd, value => ` / ${value}`) ?? ''}`,
          )}
          placement="top"
        >
          {/** Needed for tooltip to work for whatever reason */}
          <Box>
            <TokenInfo
              icon={null}
              iconPosition="right"
              primary={formatNumber(getValue(), 'token.compact')}
              secondary={maybe(row.original.amountUsd, x => formatNumber(x, 'usd.notional'))}
            />
          </Box>
        </Tooltip>
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
]
