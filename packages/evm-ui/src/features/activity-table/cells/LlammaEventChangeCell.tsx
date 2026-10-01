import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { type Token } from '@primitives/address.utils'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import type { MarketEventRow } from '../types'
import { ActivityUsdValue } from './ActivityUsdValue'
import { LlammaTokenAmount } from './LlammaTokenAmount'

const { Spacing } = SizesAndSpaces

export const LlammaEventChangeCell = ({
  event: { deposit, withdrawal, timestamp },
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
      {deposit && (
        <LlammaTokenAmount
          amount={deposit.amount}
          token={collateralToken}
          blockchainId={chain}
          secondary={<ActivityUsdValue amount={deposit.amount} amountUsd={deposit.amountUsd} timestamp={timestamp} />}
        />
      )}
      {!!withdrawal?.amountCollateral && (
        <LlammaTokenAmount
          amount={-withdrawal.amountCollateral}
          token={collateralToken}
          blockchainId={chain}
          secondary={
            <ActivityUsdValue
              amount={withdrawal.amountCollateral}
              amountUsd={withdrawal.amountCollateralUsd}
              timestamp={timestamp}
              isSold
            />
          }
        />
      )}
      {!!withdrawal?.amountBorrowed && (
        <LlammaTokenAmount
          amount={-withdrawal.amountBorrowed}
          token={borrowToken}
          blockchainId={chain}
          secondary={
            <ActivityUsdValue
              amount={withdrawal.amountBorrowed}
              amountUsd={withdrawal.amountBorrowedUsd}
              timestamp={timestamp}
              isSold
            />
          }
        />
      )}
    </Stack>
  </InlineTableCell>
)
