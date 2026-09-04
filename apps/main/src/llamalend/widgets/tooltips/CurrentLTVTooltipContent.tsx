import { TooltipWrapper, TooltipDescription } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const CurrentLTVTooltipContent = ({ debtDenomination = 'Debt' }: { debtDenomination?: string }) => (
  <TooltipWrapper>
    <TooltipDescription text={t`LTV is calculated as: (${debtDenomination} / Collateral Value) * 100`} />
  </TooltipWrapper>
)
