import { TooltipWrapper, TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'

export const CurrentLTVTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`LTV is calculated as: (Debt / Collateral Value) * 100`} />
  </TooltipWrapper>
)
