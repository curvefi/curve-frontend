import type { Chain } from '@curvefi/prices-api'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { formatNumber } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { type Token } from '@primitives/address.utils'
import { TokenInfo } from '@ui/components/TokenInfo'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import type { MarketEventRow } from '../types'

const { Spacing } = SizesAndSpaces

const AmountRow = ({ amount, token, chain }: { chain: Chain; amount: number; token: Token | undefined }) =>
  token && (
    <TokenInfo
      address={token.address}
      blockchainId={chain}
      iconPosition="right"
      iconSize="mui-md"
      primary={formatNumber(amount, { abbreviate: false })}
    />
  )

export const LlammaEventChangeCell = ({
  event: { deposit, withdrawal },
  collateralToken,
  borrowToken,
  chain,
}: {
  event: MarketEventRow
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
