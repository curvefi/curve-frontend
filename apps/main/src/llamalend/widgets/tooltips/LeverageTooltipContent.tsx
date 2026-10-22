import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const LeverageTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Your position value divided by your equity.`} />
    <TooltipDescription
      text={t`Position value is your collateral at the oracle price, plus the borrowed tokens held in your bands during soft liquidation. Equity is the position value minus your debt, including interest.`}
    />
    <TooltipDescription text={t`Calculated as: position value / (position value - debt)`} />
    <TooltipDescription
      text={t`Shown for positions that borrowed through Curve's leverage. It moves with price: it rises when collateral falls and drops when collateral gains. Below 0, your debt is worth more than your position.`}
    />
  </TooltipWrapper>
)
