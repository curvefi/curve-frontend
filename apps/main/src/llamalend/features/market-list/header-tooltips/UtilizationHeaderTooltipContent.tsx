import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'

export const UtilizationHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Percentage of supplied funds currently borrowed.`} />
    <TooltipDescription text={t`High utilization may increase borrow rates and reduce available liquidity.`} />
  </TooltipWrapper>
)
