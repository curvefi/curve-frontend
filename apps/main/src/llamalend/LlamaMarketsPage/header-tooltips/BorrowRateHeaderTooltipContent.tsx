import { t, Trans } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'

export const BorrowRateHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`The borrow rate is the cost related to your borrow. Depending on the market type it is correlated to different variables.`}
    />
    <TooltipDescription
      text={
        <Trans>
          For <strong>lending markets</strong> it varies according to the market utilization.{' '}
        </Trans>
      }
    />
    <TooltipDescription
      text={
        <Trans>
          For <strong>minting markets</strong> it varies according to the the peg of <em>crvUSD</em>.
        </Trans>
      }
    />
    <TooltipDescription
      text={t`Collateral does not earn this rate. Intrinsic yield of LSTs is not taken into account for borrow rates.`}
    />
  </TooltipWrapper>
)
