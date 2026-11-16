import {
  TooltipDescription,
  TooltipFooter,
  TooltipFormula,
  TooltipFraction,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const LiquidationBufferTooltipContent = ({ amount }: { amount?: string }) => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`At 0%, no liquidation margin remains. Below 0%, the position becomes liquidatable before the price reaches the Liquidation range. The buffer measures liquidation-adjusted margin as a percentage of debt.`}
    />
    {amount && (
      <TooltipItems secondary>
        <TooltipItem title={t`Buffer amount`} variant="independent">
          {amount}
        </TooltipItem>
      </TooltipItems>
    )}
    <TooltipFormula
      formula={
        <>
          {t`Buffer % =`}
          <TooltipFraction numerator={t`C × (1 − d) − Debt`} denominator={t`Debt`} />
          {t`× 100`}
        </>
      }
      terms={[
        { symbol: 'C', label: t`Collateral value at the range` },
        { symbol: 'd', label: t`Liquidation discount` },
      ]}
    />
    <TooltipFormula
      formula={
        <>
          {t`Buffer amount =`}
          <TooltipFraction numerator={t`Debt × Buffer %`} denominator="100" />
        </>
      }
    />
    <TooltipFooter>{t`Not a price-drop allowance or withdrawable equity.`}</TooltipFooter>
  </TooltipWrapper>
)
