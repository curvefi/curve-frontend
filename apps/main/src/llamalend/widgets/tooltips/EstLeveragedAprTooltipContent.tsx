import { TooltipDescription, TooltipFormula, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const EstLeveragedAprTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Estimated yearly return on your equity.`} />
    <TooltipDescription text={t`It's an estimate: yields, rates and rewards change over time.`} />
    <TooltipFormula
      formula={t`APR = (C × Yc + X × Yb − D × (B − R)) ÷ E`}
      terms={[
        { symbol: 'C', label: t`collateral at the oracle price` },
        { symbol: 'X', label: t`borrowed tokens in your bands` },
        { symbol: 'D', label: t`debt` },
        { symbol: 'E', label: t`equity: C + X − D` },
        { symbol: 'Yc, Yb', label: t`collateral and borrowed token yield APR` },
        { symbol: 'B, R', label: t`borrow APR and borrow rewards APR` },
      ]}
    />
  </TooltipWrapper>
)
