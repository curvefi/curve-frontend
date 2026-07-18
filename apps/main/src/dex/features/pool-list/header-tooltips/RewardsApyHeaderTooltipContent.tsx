import { t } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'

export const RewardsApyHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Annualized yield from extra token rewards and APR campaigns.`} />
    <TooltipDescription text={t`Points-only campaigns are shown separately and are not included.`} />
  </TooltipWrapper>
)
