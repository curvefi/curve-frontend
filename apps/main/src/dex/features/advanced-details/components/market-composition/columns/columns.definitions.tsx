import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo } from '@ui-kit/shared/ui/TokenInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber, shortenAddress } from '@ui-kit/utils'
import { MarketCompositionColumnId } from './columns.enum'

export type MarketCompositionRow = TableItem & {
  symbol: string
  tokenAddress: string
  blockchainId: string
  marketShare?: number
  tokenAmount?: number
  tokenAmountUsd?: number
  tokenPrice?: number
}

const columnHelper = createColumnHelper<MarketCompositionRow>()

const headers = {
  [MarketCompositionColumnId.Asset]: t`Asset`,
  [MarketCompositionColumnId.Price]: t`Price`,
  [MarketCompositionColumnId.MarketShare]: t`% of Market`,
  [MarketCompositionColumnId.TokenAmount]: t`Amount`,
} as const

export const MARKET_COMPOSITION_COLUMNS = [
  columnHelper.accessor('symbol', {
    id: MarketCompositionColumnId.Asset,
    header: headers[MarketCompositionColumnId.Asset],
    cell: ({ getValue, row }) => (
      <InlineTableCell>
        <TokenInfo
          address={row.original.tokenAddress}
          blockchainId={row.original.blockchainId}
          iconPosition="left"
          primary={getValue()}
          secondary={shortenAddress(row.original.tokenAddress)}
        />
      </InlineTableCell>
    ),
    enableSorting: false,
  }),
  columnHelper.accessor('tokenPrice', {
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
  columnHelper.accessor('tokenAmount', {
    id: MarketCompositionColumnId.TokenAmount,
    header: headers[MarketCompositionColumnId.TokenAmount],
    cell: ({ getValue, row }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <Tooltip
          title={maybe(
            getValue(),
            value =>
              !isNaN(value) &&
              `${value} ${row.original.symbol} ${maybe(row.original.tokenAmountUsd, value => ` / ${value}`) ?? ''}`,
          )}
          placement="top"
        >
          {/** Needed for tooltip to work for whatever reason */}
          <Box>
            <TokenInfo
              icon={null}
              iconPosition="right"
              primary={formatNumber(getValue(), 'token.compact')}
              secondary={maybe(row.original.tokenAmountUsd, x => formatNumber(x, 'usd.notional'))}
            />
          </Box>
        </Tooltip>
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
]
