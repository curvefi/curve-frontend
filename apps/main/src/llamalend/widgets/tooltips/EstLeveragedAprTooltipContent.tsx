import { TooltipDescription, TooltipFormula, TooltipFraction, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const EstLeveragedAprTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Estimated yearly return on your equity.`} />
    <TooltipDescription text={t`It's an estimate: yields, rates and rewards change over time.`} />
    <TooltipDescription text={t`Below it, the yield multiplier: this APR divided by the collateral yield.`} />
    <TooltipFormula
      formula={
        <>
          {t`APR =`}
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
