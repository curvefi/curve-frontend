import { ReactNode } from 'react'
import { Trans } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'

export const BORROW_APR_DESCRIPTION: Record<LlamaMarketType, ReactNode> = {
  [LlamaMarketType.Lend]: (
    <Trans>
      For <strong>lending markets</strong> it varies according to the market utilization.
    </Trans>
  ),
  [LlamaMarketType.Mint]: (
    <Trans>
      For <strong>minting markets</strong> it varies according to the the peg of crvUSD.
    </Trans>
  ),
}
