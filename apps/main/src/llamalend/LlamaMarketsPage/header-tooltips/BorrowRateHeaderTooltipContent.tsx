import { Trans } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'

export const BorrowRateHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={
        <Trans>
          <strong>
            The borrow rate is the cost related to your borrow. Depending on the market type it is correlated to
            different variables.
          </strong>
        </Trans>
      }
    />
    <TooltipDescription
      text={
        <Trans>
          For <strong>lending markets</strong> it varies according to the market utilization.
        </Trans>
      }
    />
    <TooltipDescription
      text={
        <Trans>
          For <strong>minting markets</strong> it varies according to the the peg of crvUSD.
        </Trans>
      }
    />
    <TooltipDescription
      text={
        <Trans>
          Collateral does <strong>not</strong> earn this rate. Intrinsic yield of LSTs & token rewards are taken into
          account for borrow rates.
        </Trans>
      }
    />
  </TooltipWrapper>
)
