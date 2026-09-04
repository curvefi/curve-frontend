import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const UtilizationHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Percentage of supplied funds currently borrowed.`} />
    <TooltipDescription text={t`High utilization may increase borrow rates and reduce available liquidity.`} />
  </TooltipWrapper>
)
