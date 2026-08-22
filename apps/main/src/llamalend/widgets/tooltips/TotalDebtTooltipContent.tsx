import { t } from '@evm-ui/lib/i18n'
import { TooltipWrapper, TooltipDescription } from '@evm-ui/shared/ui/TooltipComponents'

export const TotalDebtTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Total amount you've borrowed, including accrued interest.`} />
    <TooltipDescription text={t`Denominated in the debt token (e.g., crvUSD).`} />
  </TooltipWrapper>
)
