import { ReactNode } from 'react'
import { Trans } from '@ui-kit/lib/i18n'
import { MarketType } from '@ui-kit/types/market'

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
