import { t } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'

export const VolumeHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`USD value of swaps completed in this pool over the past 24 hours.`} />
    <TooltipDescription text={t`Volume measures trading activity, not the amount of liquidity deposited.`} />
  </TooltipWrapper>
)
