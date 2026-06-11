import { type Token } from '@primitives/address.utils'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo } from '@ui-kit/shared/ui/TokenInfo'
import { formatNumber } from '@ui-kit/utils'
import { AddressCell, TimestampCell } from '../cells'
import { PoolLiquidityActionCell } from '../cells/PoolLiquidityActionCell'
import type { PoolLiquidityRow } from '../types'

export enum PoolLiquidityColumnId {
  Action = 'eventType',
  User = 'provider',
  Time = 'time',
}

export const getTokenAmountColumnId = (tokenIndex: number): string => `tokenAmount_${tokenIndex}`

const columnHelper = createColumnHelper<PoolLiquidityRow>()

type CreatePoolLiquidityColumnsParams = {
  poolTokens: Token[]
}

export const createPoolLiquidityColumns = ({ poolTokens }: CreatePoolLiquidityColumnsParams) => {
  const baseColumns = [
    columnHelper.accessor('provider', {
      id: PoolLiquidityColumnId.User,
      header: t`Address`,
      cell: ({ getValue, row }) => <AddressCell address={getValue()} explorerUrl={row.original.providerUrl} />,
    }),
    columnHelper.display({
      id: PoolLiquidityColumnId.Action,
      header: t`Action`,
      cell: ({ row }) => <PoolLiquidityActionCell event={row.original} />,
    }),
  ]

  // Generate one column per token
  const tokenColumns = poolTokens.map((token, index) =>
    columnHelper.display({
      id: getTokenAmountColumnId(index),
      header: token.symbol ?? t`Token ${index + 1}`,
      cell: ({ row }) => {
        const { tokenAmounts, network, eventType } = row.original
        const amount = tokenAmounts[index] ?? 0
        const isAdd = eventType === 'AddLiquidity'
        const displayAmount = isAdd ? amount : -amount

        return (
          <InlineTableCell sx={{ alignItems: 'end' }}>
            {amount === 0 ? (
              '-'
            ) : (
              <TokenInfo
                address={token.address}
                blockchainId={network}
                iconPosition="right"
                primary={formatNumber(displayAmount, { abbreviate: false })}
              />
            )}
          </InlineTableCell>
        )
      },
      meta: { type: 'numeric' },
    }),
  )

  const remainingColumns = [
    columnHelper.accessor('time', {
      id: PoolLiquidityColumnId.Time,
      header: t`Time`,
      cell: ({ row }) => (
        <TimestampCell timestamp={new Date(row.original.time)} txUrl={row.original.txUrl} align="end" />
      ),
      meta: { type: 'numeric' },
    }),
  ]

  return [...baseColumns, ...tokenColumns, ...remainingColumns]
}
