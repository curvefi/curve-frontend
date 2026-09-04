import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const RewardsApyHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Annualized yield from extra token rewards and APR campaigns.`} />
    <TooltipDescription text={t`Points-only campaigns are shown separately and are not included.`} />
  </TooltipWrapper>
)
