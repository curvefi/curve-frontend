import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ActivityTableCell } from '@ui-kit/features/activity-table'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { EventRow, Token } from '../hooks/useLlammaActivity'

const { Spacing } = SizesAndSpaces

type EventChangeCellProps = {
  event: EventRow
  chain: Chain
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}

type AmountRowProps = {
  chain: Chain
  amount: number
  amountUsd?: number | null
  token: Token | undefined
}

const AmountRow = ({ amount, amountUsd, token, chain }: AmountRowProps) => (
  <Stack direction="row" justifyContent="right" gap={Spacing.xs}>
    <Stack gap={Spacing.sm}>
      <Typography variant="tableCellMBold" color={amount >= 0 ? 'success' : 'error'}>
        {amount >= 0 ? '+' : ''}
        {formatNumber(amount, { abbreviate: false })} {token?.symbol}
      </Typography>
      {amountUsd != null && (
        <Typography variant="bodySRegular" sx={(t) => ({ color: t.design.Text.TextColors.Secondary })}>
          {formatNumber(amountUsd, { unit: 'dollar', abbreviate: true })}
        </Typography>
      )}
    </Stack>
    <TokenIcon blockchainId={chain} address={token?.address} size="mui-sm" />
  </Stack>
)

export const EventChangeCell = ({ event, collateralToken, borrowToken, chain }: EventChangeCellProps) => {
  const { deposit, withdrawal } = event

  if (deposit) {
    return (
      <ActivityTableCell>
        <AmountRow amount={deposit.amount} token={collateralToken} chain={chain} />
      </ActivityTableCell>
    )
  }

  if (withdrawal) {
    return (
      <ActivityTableCell>
        <Stack gap={Spacing.xs}>
          {withdrawal.amountCollateral !== 0 && (
            <AmountRow amount={-withdrawal.amountCollateral} token={collateralToken} chain={chain} />
          )}
          {withdrawal.amountBorrowed !== 0 && (
            <AmountRow amount={-withdrawal.amountBorrowed} token={borrowToken} chain={chain} />
          )}
        </Stack>
      </ActivityTableCell>
    )
  }

  return null
}
