import { t } from '@evm-ui/lib/i18n'
import { TooltipWrapper, TooltipDescription } from '@evm-ui/shared/ui/TooltipComponents'

export const CurrentLTVTooltipContent = ({ debtDenomination = 'Debt' }: { debtDenomination?: string }) => (
  <TooltipWrapper>
    <TooltipDescription text={t`LTV is calculated as: (${debtDenomination} / Collateral Value) * 100`} />
  </TooltipWrapper>
)
