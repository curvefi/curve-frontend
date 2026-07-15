import { TooltipDescription, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Trans } from '@ui-kit/lib/i18n'
import { MarketType } from '@ui-kit/types/market'
import { BORROW_APR_DESCRIPTION } from './constants'

export const NetBorrowAprHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={
        <Trans>
          <strong>
            The net borrow APR is the cost related to your borrow. Depending on the market type it is correlated to
            different variables.
          </strong>
        </Trans>
      }
    />
    <TooltipDescription text={BORROW_APR_DESCRIPTION[MarketType.Lend]} />
    <TooltipDescription text={BORROW_APR_DESCRIPTION[MarketType.Mint]} />
    <TooltipDescription
      text={
        <Trans>
          Collateral does <strong>not</strong> earn this rate. Intrinsic yield of LSTs & token rewards are taken into
          account for net borrow APR.
        </Trans>
      }
    />
  </TooltipWrapper>
)
