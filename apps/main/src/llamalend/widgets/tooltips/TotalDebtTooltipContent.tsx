import { TooltipWrapper, TooltipDescription } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const TotalDebtTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Total amount you've borrowed, including accrued interest.`} />
    <TooltipDescription text={t`Denominated in the debt token (e.g., crvUSD).`} />
  </TooltipWrapper>
)
