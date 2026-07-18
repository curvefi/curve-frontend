import { t } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'

export const PointsHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Non-APY rewards offered through external campaigns.`} />
    <TooltipDescription text={t`Values may appear as a multiplier, campaign symbol, or ‘Points’.`} />
    <TooltipDescription text={t`Points are tracked separately and are not included in APY calculations.`} />
  </TooltipWrapper>
)
