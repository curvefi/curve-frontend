import { TooltipDescription, TooltipFooter, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const PnlTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`PNL (profit and loss): how much your position has gained or lost since you opened it, counting your deposits, withdrawals, borrows and repays. Hover the value to see it per token.`}
    />
    <TooltipDescription
      text={t`ROI (return on investment): PNL as a percentage of what you invested, including what you borrowed to your wallet.`}
    />
    <TooltipFooter>{t`Excludes price impact you would pay to close.`}</TooltipFooter>
  </TooltipWrapper>
)
