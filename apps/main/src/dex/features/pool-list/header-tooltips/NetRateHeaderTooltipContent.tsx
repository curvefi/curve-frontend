import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'

export const NetRateHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Estimated net yield for the pool.`} />
    <TooltipDescription text={t`Net APR is the sum of base APR, unboosted CRV gauge APR, and rewards APR.`} />
    <TooltipDescription text={t`Points are excluded because they are not percentage-based yield.`} />
  </TooltipWrapper>
)
