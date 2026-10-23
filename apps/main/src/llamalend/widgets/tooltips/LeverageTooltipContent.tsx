import { TooltipDescription, TooltipFormula, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const LeverageTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Your position value divided by your equity.`} />
    <TooltipDescription
      text={t`It moves with price: it rises when collateral falls and drops when collateral gains.`}
    />
    <TooltipFormula
      formula={t`Leverage = (C + X) ÷ (C + X − debt)`}
      terms={[
        { symbol: 'C', label: t`collateral at the oracle price` },
        { symbol: 'X', label: t`collateral converted to the borrowed token during soft liquidation` },
      ]}
    />
  </TooltipWrapper>
)
