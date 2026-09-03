import type { Chain } from '@curvefi/prices-api'
import { t } from '@evm-ui/lib/i18n'
import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenIcon } from '@evm-ui/shared/ui/TokenIcon'
import { TokenInfo } from '@evm-ui/shared/ui/TokenInfo'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { formatNumber } from '@evm-ui/utils'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'
import Stack from '@mui/material/Stack'
import { type Token } from '@primitives/address.utils'
import { AddressCell, TimestampCell } from '../cells'
import { PoolLiquidityActionCell } from '../cells/PoolLiquidityActionCell'
import type { PoolLiquidityRow } from '../types'

const { Spacing } = SizesAndSpaces

export enum PoolLiquidityColumnId {
  Action = 'eventType',
  User = 'provider',
  Time = 'time',
}

export const getTokenAmountColumnId = (tokenIndex: number): string => `tokenAmount_${tokenIndex}`

const columnHelper = createAppColumnHelper<PoolLiquidityRow>()

type CreatePoolLiquidityColumnsParams = {
  blockchainId: Chain | undefined
  poolTokens: Token[]
}

export const createPoolLiquidityColumns = ({ blockchainId, poolTokens }: CreatePoolLiquidityColumnsParams) =>
  columnHelper.columns([
    columnHelper.accessor('provider', {
      id: PoolLiquidityColumnId.User,
      header: t`Address`,
      cell: ({ getValue, row }) => (
        <AddressCell address={getValue()} explorerUrl={scanAddressPath(row.original.chainId, row.original.provider)} />
      ),
    }),
    columnHelper.display({
      id: PoolLiquidityColumnId.Action,
      header: t`Action`,
      cell: ({ row }) => <PoolLiquidityActionCell event={row.original} />,
    }),
    // Generate one column per token
    ...poolTokens.map((token, index) =>
      columnHelper.display({
        id: getTokenAmountColumnId(index),
        header: () => (
          <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
            {token.symbol ?? t`Token ${index + 1}`}
            <TokenIcon blockchainId={blockchainId} address={token.address} size="mui-md" />
          </Stack>
        ),
        cell: ({ row }) => {
          const { tokenAmounts, eventType } = row.original
          const amount = tokenAmounts[index] ?? 0
          const isAdd = eventType === 'AddLiquidity'
          const displayAmount = isAdd ? amount : -amount

          return (
            <InlineTableCell sx={{ alignItems: 'end' }}>
              <TokenInfo
                icon={null}
                iconPosition="right"
                // 0 is a valid value returned by the prices api, but our convention is to show - rather than zero.
                primary={amount === 0 ? '-' : formatNumber(displayAmount, 'token.amount')}
              />
            </InlineTableCell>
          )
        },
        meta: { type: 'numeric' },
      }),
    ),
    columnHelper.accessor('time', {
      id: PoolLiquidityColumnId.Time,
      header: t`Time`,
      cell: ({ row }) => (
        <TimestampCell
          timestamp={new Date(row.original.time)}
          txUrl={scanTxPath(row.original.chainId, row.original.txHash)}
          align="end"
        />
      ),
      meta: { type: 'numeric' },
    }),
  ])
