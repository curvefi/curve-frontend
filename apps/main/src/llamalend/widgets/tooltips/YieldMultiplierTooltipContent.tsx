import { TooltipDescription, TooltipFormula, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const YieldMultiplierTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`How many times the collateral yield your equity earns.`} />
    <TooltipFormula formula={t`Est. leveraged APR ÷ collateral yield APR`} />
  </TooltipWrapper>
)
