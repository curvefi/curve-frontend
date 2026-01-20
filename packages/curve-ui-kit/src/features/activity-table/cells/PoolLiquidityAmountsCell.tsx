import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { PoolLiquidityRow, Token } from '../types'
import { ActivityTableCell } from './ActivityTableCell'

const { Spacing } = SizesAndSpaces

type AmountRowProps = {
  chain: Chain
  amount: number
  token: Token | undefined
  isAdd: boolean
}

const AmountRow = ({ amount, token, chain, isAdd }: AmountRowProps) => {
  const displayAmount = isAdd ? amount : -amount
  const prefix = isAdd ? '+' : ''

  return (
    <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={Spacing.xs}>
      <Typography variant="tableCellMBold">
        {prefix}
        {formatNumber(displayAmount, { abbreviate: false })} {token?.symbol ?? '?'}
      </Typography>
      <TokenIcon blockchainId={chain} address={token?.address} size="mui-sm" />
    </Stack>
  )
}

type PoolLiquidityAmountsCellProps = {
  event: PoolLiquidityRow
}

export const PoolLiquidityAmountsCell = ({ event }: PoolLiquidityAmountsCellProps) => {
  const { tokenAmounts, poolTokens, network, eventType } = event
  const isAdd = eventType === 'AddLiquidity'

  // Filter out zero amounts for display
  const nonZeroAmounts = tokenAmounts
    .map((amount, index) => ({ amount, token: poolTokens[index] }))
    .filter(({ amount }) => amount !== 0)

  if (nonZeroAmounts.length === 0) {
    return (
      <ActivityTableCell>
        <Typography variant="tableCellMBold" color="textSecondary">
          -
        </Typography>
      </ActivityTableCell>
    )
  }

  return (
    <ActivityTableCell>
      <Stack gap={Spacing.xs}>
        {nonZeroAmounts.map(({ amount, token }, index) => (
          <AmountRow key={token?.address ?? index} amount={amount} token={token} chain={network} isAdd={isAdd} />
        ))}
      </Stack>
    </ActivityTableCell>
  )
}
