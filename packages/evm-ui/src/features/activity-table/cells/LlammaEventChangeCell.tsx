import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { type Token } from '@primitives/address.utils'
import type { Size } from '@ui-kit/shared/ui//TokenIcon'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo } from '@ui-kit/shared/ui/TokenInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { MarketEventRow } from '../types'

const { Spacing } = SizesAndSpaces

const AmountRow = ({
  amount,
  token,
  chain,
  iconSize,
}: {
  chain: Chain
  amount: number
  token: Token | undefined
  iconSize?: Size
}) =>
  token && (
    <TokenInfo
      address={token.address}
      blockchainId={chain}
      iconPosition="right"
      iconSize={iconSize}
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
}) => {
  // use a smaller icon size for cells containing two rows to eliminate token icon overlap
  const iconSize = withdrawal?.amountCollateral && withdrawal.amountBorrowed ? 'mui-md' : undefined

  return (
    <InlineTableCell>
      <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
        {deposit && <AmountRow amount={deposit.amount} token={collateralToken} chain={chain} />}
        {!!withdrawal?.amountCollateral && (
          <AmountRow amount={-withdrawal.amountCollateral} token={collateralToken} chain={chain} iconSize={iconSize} />
        )}
        {!!withdrawal?.amountBorrowed && (
          <AmountRow amount={-withdrawal.amountBorrowed} token={borrowToken} chain={chain} iconSize={iconSize} />
        )}
      </Stack>
    </InlineTableCell>
  )
}
