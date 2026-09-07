import type { Chain } from '@curvefi/prices-api'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import Stack from '@mui/material/Stack'
import { type Token } from '@primitives/address.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import type { MarketEventRow } from '../types'
import { LlammaTokenAmount } from './LlammaTokenAmount'

const { Spacing } = SizesAndSpaces

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
      {deposit && <LlammaTokenAmount amount={deposit.amount} token={collateralToken} blockchainId={chain} />}
      {!!withdrawal?.amountCollateral && (
        <LlammaTokenAmount amount={-withdrawal.amountCollateral} token={collateralToken} blockchainId={chain} />
      )}
      {!!withdrawal?.amountBorrowed && (
        <LlammaTokenAmount amount={-withdrawal.amountBorrowed} token={borrowToken} blockchainId={chain} />
      )}
    </Stack>
  </InlineTableCell>
)
