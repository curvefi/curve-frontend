import { t } from '@ui-kit/lib/i18n'
import { TooltipWrapper, TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'

export const CurrentLTVTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`LTV is calculated as: (Debt / Collateral Value) * 100`} />
  </TooltipWrapper>
)
