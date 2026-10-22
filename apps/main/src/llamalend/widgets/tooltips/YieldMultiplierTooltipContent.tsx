import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const YieldMultiplierTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`How many times the collateral yield your equity earns.`} />
    <TooltipDescription text={t`The est. leveraged APR divided by the collateral yield APR.`} />
  </TooltipWrapper>
)
