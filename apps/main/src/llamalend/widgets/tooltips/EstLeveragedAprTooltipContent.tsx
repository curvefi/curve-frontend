import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const EstLeveragedAprTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Estimated yearly return on your equity.`} />
    <TooltipDescription
      text={t`What your collateral and the borrowed tokens in your bands earn, minus the borrow rate net of borrow rewards, divided by your equity.`}
    />
    <TooltipDescription text={t`It's an estimate: yields, rates and rewards change over time.`} />
  </TooltipWrapper>
)
