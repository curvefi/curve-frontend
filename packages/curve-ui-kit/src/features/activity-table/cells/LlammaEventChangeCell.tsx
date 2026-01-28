import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { LlammaEventRow, Token } from '../types'

const { Spacing } = SizesAndSpaces

type LlammaEventChangeCellProps = {
  event: LlammaEventRow
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
  <Stack direction="row" alignItems="center" justifyContent="right" gap={Spacing.xs}>
    <Stack gap={Spacing.sm}>
      <Typography variant="tableCellMBold">{formatNumber(amount, { abbreviate: false })}</Typography>
      {amountUsd != null && (
        <Typography variant="bodySRegular" sx={(t) => ({ color: t.design.Text.TextColors.Secondary })}>
          {formatNumber(amountUsd, { unit: 'dollar', abbreviate: true })}
        </Typography>
      )}
    </Stack>
    <TokenIcon blockchainId={chain} address={token?.address} size="lg" />
  </Stack>
)

export const LlammaEventChangeCell = ({ event, collateralToken, borrowToken, chain }: LlammaEventChangeCellProps) => {
  const { deposit, withdrawal } = event

  if (deposit) {
    return (
      <InlineTableCell>
        <AmountRow amount={deposit.amount} token={collateralToken} chain={chain} />
      </InlineTableCell>
    )
  }

  if (withdrawal) {
    return (
      <InlineTableCell>
        <Stack gap={Spacing.xs}>
          {withdrawal.amountCollateral !== 0 && (
            <AmountRow amount={-withdrawal.amountCollateral} token={collateralToken} chain={chain} />
          )}
          {withdrawal.amountBorrowed !== 0 && (
            <AmountRow amount={-withdrawal.amountBorrowed} token={borrowToken} chain={chain} />
          )}
        </Stack>
      </InlineTableCell>
    )
  }

  return null
}
