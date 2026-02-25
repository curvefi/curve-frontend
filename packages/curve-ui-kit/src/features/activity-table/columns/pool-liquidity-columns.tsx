import { Token } from '@primitives/address.utils'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { AddressCell, TimestampCell, TokenAmountCell } from '../cells'
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
      cell: ({ getValue }) => <AddressCell address={getValue()} />,
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
          <TokenAmountCell
            amount={displayAmount}
            symbol={token.symbol}
            tokenAddress={token.address}
            chainId={network}
            align="right"
          />
        )
      },
      meta: { type: 'numeric' },
    }),
  )

  const remainingColumns = [
    columnHelper.accessor('time', {
      id: PoolLiquidityColumnId.Time,
      header: t`Time`,
      cell: ({ row }) => <TimestampCell timestamp={row.original.time} txUrl={row.original.txUrl} />,
      meta: { type: 'numeric' },
    }),
  ]

  return [...baseColumns, ...tokenColumns, ...remainingColumns]
}
