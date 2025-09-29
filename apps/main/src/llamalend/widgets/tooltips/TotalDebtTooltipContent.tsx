import { TooltipWrapper, TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'

export const TotalDebtTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Total amount you've borrowed, including accrued interest.`} />
    <TooltipDescription text={t`Denominated in the debt token (e.g., crvUSD).`} />
  </TooltipWrapper>
)
