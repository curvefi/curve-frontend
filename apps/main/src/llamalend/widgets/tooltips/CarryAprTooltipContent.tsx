import { TooltipDescription, TooltipFormula, TooltipFraction, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const CarryAprTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Estimated yearly yield on your equity, after borrowing costs.`} />
    <TooltipDescription text={t`It's an estimate: yields, rates and rewards change over time.`} />
    <TooltipDescription text={t`Below it, the yield multiplier: the carry APR divided by the collateral yield.`} />
    <TooltipFormula
      formula={
        <>
          {t`Carry APR =`}
          <TooltipFraction numerator={t`Y − B`} denominator={t`E`} />
        </>
      }
      terms={[
        { symbol: 'Y', label: t`yield earned on your collateral` },
        {
          symbol: 'B',
          label: t`net borrow cost: interest on your debt minus borrow rewards, plus the yield of the borrowed token on the debt not covered by the converted tokens`,
        },
        { symbol: 'E', label: t`equity: collateral + converted tokens − debt` },
      ]}
    />
  </TooltipWrapper>
)
