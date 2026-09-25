import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const NetBorrowAprHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`Borrow APR is the interest charged on the debt. It follows the market's monetary policy. On mint markets it also follows crvUSD's peg and borrow incentives. It does not include collateral yield.`}
    />
    <TooltipDescription
      text={t`Estimated net borrow APR subtracts collateral yield and incentives from Borrow APR. That estimate is a same-asset comparison only when the yield is paid in the debt asset. When it is not, as with wstETH yield against crvUSD debt, it is not the borrow cost.`}
    />
  </TooltipWrapper>
)
