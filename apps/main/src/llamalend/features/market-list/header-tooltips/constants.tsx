import { ReactNode } from 'react'
import { MarketType } from '@evm-ui/types/market'
import { Trans } from '@ui/lib/i18n'

export const BORROW_APR_DESCRIPTION: Record<MarketType, ReactNode> = {
  [MarketType.Lend]: (
    <Trans>
      For <strong>lending markets</strong> it varies according to the market utilization.
    </Trans>
  ),
  [MarketType.Mint]: (
    <Trans>
      For <strong>minting markets</strong> it varies according to the the peg of crvUSD.
    </Trans>
  ),
}
