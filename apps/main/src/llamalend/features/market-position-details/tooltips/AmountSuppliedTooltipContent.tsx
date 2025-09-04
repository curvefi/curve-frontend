import { t } from '@ui-kit/lib/i18n'
import { TooltipWrapper, TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'

export const AmountSuppliedTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`The total amount of the debt token (e.g., crvUSD) you have deposited into this lending market.`}
    />
    <TooltipDescription text={t`This capital is used by borrowers and earns interest and potentially rewards.`} />
  </TooltipWrapper>
)
