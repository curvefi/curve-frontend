import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { TimestampCell, AddressCell, TokenAmountCell } from '../cells'
import { PoolLiquidityActionCell } from '../cells/PoolLiquidityActionCell'
import type { PoolLiquidityRow, Token } from '../types'

export enum PoolLiquidityColumnId {
  Action = 'eventType',
  User = 'provider',
  Time = 'time',
}

/**
 * Generate a column ID for a token amount column
 */
export const getTokenAmountColumnId = (tokenIndex: number): string => `tokenAmount_${tokenIndex}`

const columnHelper = createColumnHelper<PoolLiquidityRow>()

type CreatePoolLiquidityColumnsParams = {
  /** Pool tokens in order matching tokenAmounts array */
  poolTokens: Token[]
}

export const createPoolLiquidityColumns = ({
  poolTokens,
}: CreatePoolLiquidityColumnsParams): ColumnDef<PoolLiquidityRow, unknown>[] => {
  const baseColumns: ColumnDef<PoolLiquidityRow, unknown>[] = [
    columnHelper.display({
      id: PoolLiquidityColumnId.Action,
      header: t`Action`,
      cell: ({ row }) => <PoolLiquidityActionCell event={row.original} />,
    }) as ColumnDef<PoolLiquidityRow, unknown>,
  ]

  // Generate one column per token
  const tokenColumns: ColumnDef<PoolLiquidityRow, unknown>[] = poolTokens.map(
    (token, index) =>
      columnHelper.display({
        id: getTokenAmountColumnId(index),
        header: token.symbol ?? t`Token ${index + 1}`,
        cell: ({ row }) => {
          const { tokenAmounts, network, eventType } = row.original
          const amount = tokenAmounts[index] ?? 0
          const isAdd = eventType === 'AddLiquidity'
          // For RemoveLiquidity, make amount negative; for AddLiquidity, keep positive
          const displayAmount = isAdd ? amount : amount !== 0 ? -amount : 0

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
      }) as ColumnDef<PoolLiquidityRow, unknown>,
  )

  const remainingColumns: ColumnDef<PoolLiquidityRow, unknown>[] = [
    columnHelper.accessor('provider', {
      id: PoolLiquidityColumnId.User,
      header: t`Address`,
      cell: ({ getValue }) => <AddressCell address={getValue()} />,
      meta: { type: 'numeric' },
    }) as ColumnDef<PoolLiquidityRow, unknown>,
    columnHelper.accessor('time', {
      id: PoolLiquidityColumnId.Time,
      header: t`Time`,
      cell: ({ row }) => <TimestampCell timestamp={row.original.time} txUrl={row.original.url} />,
      meta: { type: 'numeric' },
    }) as ColumnDef<PoolLiquidityRow, unknown>,
  ]

  return [...baseColumns, ...tokenColumns, ...remainingColumns]
}
