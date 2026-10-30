import Box from '@mui/material/Box'
import type { Amount } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import type { ColumnVisibilityState } from '@tanstack/react-table'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { TokenCell } from '@ui/components/TokenCell'
import { TokenInfo, type TokenInfoTokenIconProps } from '@ui/components/TokenInfo'
import { Tooltip } from '@ui/components/Tooltip'
import { type QueryOrValue, toValue } from '@ui/features/queries/util'
import { createAppColumnHelper } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'
import { PoolCompositionColumnId } from './columns.enum'

export type PoolCompositionRow = {
  source: Omit<TokenInfoTokenIconProps, 'primary'> & { primary: QueryOrValue<string> }
  displayAddress: string
  explorerUrl?: string
  marketShare: Amount | undefined
  amount: Amount | undefined
  amountUsd: Amount | undefined
  price: number | undefined
}

const columnHelper = createAppColumnHelper<PoolCompositionRow>()

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
} satisfies ColumnVisibilityState

export const POOL_COMPOSITION_COLUMNS = columnHelper.columns([
  columnHelper.accessor('source', {
    id: PoolCompositionColumnId.Asset,
    header: headers[PoolCompositionColumnId.Asset],
    cell: ({ getValue, row }) => (
      <TokenCell
        source={getValue()}
        displayAddress={row.original.displayAddress}
        explorerUrl={row.original.explorerUrl}
      />
    ),
    enableSorting: false,
  }),
  columnHelper.accessor('price', {
    id: PoolCompositionColumnId.Price,
    header: headers[PoolCompositionColumnId.Price],
    cell: ({ getValue }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <TokenInfo iconPosition="right" primary={formatNumber(getValue(), 'usd.precise')} />
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('marketShare', {
    id: PoolCompositionColumnId.Balance,
    header: headers[PoolCompositionColumnId.Balance],
    cell: ({ getValue }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <TokenInfo iconPosition="right" primary={formatNumber(getValue(), 'percent.rate')} />
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('amount', {
    id: PoolCompositionColumnId.TokenAmount,
    header: headers[PoolCompositionColumnId.TokenAmount],
    cell: ({ getValue, row }) => {
      const symbol = toValue(row.original.source.primary)
      return (
        <InlineTableCell sx={{ alignItems: 'end' }}>
          <Tooltip
            title={maybes(
              [getValue(), symbol],
              (value, symbol) =>
                `${formatToken(value, symbol)}${maybe(row.original.amountUsd, value => ` / ${value}`) ?? ''}`,
            )}
            placement="top"
          >
            {/** Needed for tooltip to work for whatever reason */}
            <Box>
              <TokenInfo
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
])
