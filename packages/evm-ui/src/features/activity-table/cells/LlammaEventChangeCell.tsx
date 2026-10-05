import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { type Token } from '@primitives/address.utils'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import type { MarketEventRow } from '../types'
import { formatActivityUsdValue } from '../utils'
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
}) => {
  const currentDate = useCurrentDate()
  return (
    <InlineTableCell>
      <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
        {deposit && (
          <LlammaTokenAmount
            amount={deposit.amount}
            token={collateralToken}
            blockchainId={chain}
            notional={formatActivityUsdValue(
              { amount: deposit.amount, amountUsd: deposit.amountUsd, timestamp },
              currentDate,
            )}
          />
        )}
        {!!withdrawal?.amountCollateral && (
          <LlammaTokenAmount
            amount={-withdrawal.amountCollateral}
            token={collateralToken}
            blockchainId={chain}
            notional={formatActivityUsdValue(
              {
                amount: withdrawal.amountCollateral,
                amountUsd: withdrawal.amountCollateralUsd,
                timestamp,
                isSold: true,
              },
              currentDate,
            )}
          />
        )}
        {!!withdrawal?.amountBorrowed && (
          <LlammaTokenAmount
            amount={-withdrawal.amountBorrowed}
            token={borrowToken}
            blockchainId={chain}
            notional={formatActivityUsdValue(
              { amount: withdrawal.amountBorrowed, amountUsd: withdrawal.amountBorrowedUsd, timestamp, isSold: true },
              currentDate,
            )}
          />
        )}
      </Stack>
    </InlineTableCell>
  )
}
