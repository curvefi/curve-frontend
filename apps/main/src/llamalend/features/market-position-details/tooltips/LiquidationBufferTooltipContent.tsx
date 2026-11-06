import { TooltipDescription, TooltipFormula, TooltipFraction, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const LiquidationBufferTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`Liquidation buffer is the margin left once the price reaches the top of your liquidation range, as a percentage of your debt. Inside or below the range, it is the margin left before hard liquidation.`}
    />
    <TooltipFormula
      formula={
        <>
          {t`Buffer =`}
          <TooltipFraction numerator={t`C × (1 − d)`} denominator={t`debt`} />
          {t`− 1`}
        </>
      }
      terms={[
        { symbol: 'C', label: t`collateral value when converted through your liquidation range` },
        { symbol: 'd', label: t`liquidation discount of the market` },
      ]}
    />
    <TooltipDescription
      text={t`At 0% or below, your position can be hard-liquidated before the price reaches your range.`}
    />
  </TooltipWrapper>
)
