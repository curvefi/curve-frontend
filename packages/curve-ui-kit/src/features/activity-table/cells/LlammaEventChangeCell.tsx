import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { type Token } from '@primitives/address.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo } from '@ui-kit/shared/ui/TokenInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { LlammaEventRow } from '../types'

const { Spacing } = SizesAndSpaces

const AmountRow = ({ amount, token, chain }: { chain: Chain; amount: number; token: Token | undefined }) =>
  token && (
    <TokenInfo
      address={token.address}
      blockchainId={chain}
      iconPosition="right"
      primary={formatNumber(amount, { abbreviate: false })}
    />
  )

export const LlammaEventChangeCell = ({
  event: { deposit, withdrawal },
  collateralToken,
  borrowToken,
  chain,
}: {
  event: LlammaEventRow
  chain: Chain
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}) => (
  <InlineTableCell>
    <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
      {deposit && <AmountRow amount={deposit.amount} token={collateralToken} chain={chain} />}
      {!!withdrawal?.amountCollateral && (
        <AmountRow amount={-withdrawal.amountCollateral} token={collateralToken} chain={chain} />
      )}
      {!!withdrawal?.amountBorrowed && (
        <AmountRow amount={-withdrawal.amountBorrowed} token={borrowToken} chain={chain} />
      )}
    </Stack>
  </InlineTableCell>
)
