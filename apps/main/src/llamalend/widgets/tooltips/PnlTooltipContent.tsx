import { TooltipDescription, TooltipFooter, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const PnlTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`PNL: how much your position has gained or lost since you opened it, counting your deposits, withdrawals, borrows and repays. Shown in the collateral token. Hover the value to see it in the debt token.`}
    />
    <TooltipDescription
      text={t`ROE: PNL as a percentage of what you invested in, including what you borrowed to your wallet.`}
    />
    <TooltipFooter>{t`Excludes price impact you would pay to close.`}</TooltipFooter>
  </TooltipWrapper>
)
