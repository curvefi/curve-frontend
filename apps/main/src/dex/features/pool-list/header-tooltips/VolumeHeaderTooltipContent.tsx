import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const VolumeHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`USD value of swaps completed in this pool over the past 24 hours.`} />
    <TooltipDescription text={t`Volume measures trading activity, not the amount of liquidity deposited.`} />
  </TooltipWrapper>
)
