import { TooltipDescription, TooltipFooter, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const PnlTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`PNL is the change in equity since you opened, after deposits, withdrawals, borrows to your wallet and repays. It counts in the collateral token, with each of those converted at the oracle price of its day. Hover it for the debt-token value.`}
    />
    <TooltipDescription
      text={t`ROE is PNL divided by your own capital: what you put in, plus what you borrowed to your wallet.`}
    />
    <TooltipFooter>{t`Excludes price impact you would pay to close.`}</TooltipFooter>
  </TooltipWrapper>
)
