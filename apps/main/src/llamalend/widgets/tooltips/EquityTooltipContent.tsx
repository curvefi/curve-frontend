import { TooltipDescription, TooltipFooter, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const EquityTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`What this position returns if you close it now: collateral at the oracle price plus converted borrowed tokens, minus debt. Borrowed tokens already in your wallet are not included.`}
    />
    <TooltipFooter>{t`Excludes price impact you would pay to close.`}</TooltipFooter>
  </TooltipWrapper>
)
