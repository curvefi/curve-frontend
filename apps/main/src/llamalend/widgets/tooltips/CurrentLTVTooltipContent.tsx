import { TooltipWrapper, TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'

export const CurrentLTVTooltipContent = ({ debtDenomination = 'Debt' }: { debtDenomination?: string }) => (
  <TooltipWrapper>
    <TooltipDescription text={t`LTV is calculated as: (${debtDenomination} / Collateral Value) * 100`} />
  </TooltipWrapper>
)
