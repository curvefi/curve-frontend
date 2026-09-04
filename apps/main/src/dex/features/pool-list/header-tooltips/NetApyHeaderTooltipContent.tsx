import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const NetApyHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Estimated net annualized yield for the pool.`} />
    <TooltipDescription text={t`Net APY is the sum of Base APY, unboosted CRV gauge APY, and Rewards APY.`} />
    <TooltipDescription text={t`Points are excluded because they are not percentage-based yield.`} />
  </TooltipWrapper>
)
