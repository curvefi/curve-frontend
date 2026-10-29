import { TooltipDescription, TooltipFormula, TooltipFraction, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const LoopedAprTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Estimated yearly yield on your equity, after borrowing costs.`} />
    <TooltipDescription text={t`It's an estimate: yields, rates and rewards change over time.`} />
    <TooltipDescription text={t`Below it, the yield multiplier: the looped APR divided by the collateral yield.`} />
    <TooltipFormula
      formula={
        <>
          {t`Looped APR =`}
          <TooltipFraction numerator={t`Yield earned − net borrow cost`} denominator={t`Equity`} />
        </>
      }
      terms={[
        { symbol: t`Yield earned`, label: t`yield on your collateral and on the tokens converted in soft liquidation` },
        { symbol: t`Net borrow cost`, label: t`interest on your debt minus borrow rewards` },
        { symbol: t`Equity`, label: t`collateral + converted tokens − debt` },
      ]}
    />
  </TooltipWrapper>
)
