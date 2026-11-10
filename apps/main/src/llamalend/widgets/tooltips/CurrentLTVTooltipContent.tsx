import { TooltipDescription, TooltipFormula, TooltipFraction, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const CurrentLTVTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Your debt as a percentage of your collateral value.`} />
    <TooltipFormula
      formula={
        <>
          {t`LTV =`}
          <TooltipFraction numerator={t`debt`} denominator={t`C + X`} />
          {t`× 100`}
        </>
      }
      terms={[
        { symbol: 'C', label: t`collateral at the oracle price` },
        { symbol: 'X', label: t`collateral converted to the borrowed token during soft liquidation` },
      ]}
    />
  </TooltipWrapper>
)
