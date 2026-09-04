import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const PointsHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Non-APY rewards offered through external campaigns.`} />
    <TooltipDescription text={t`Values may appear as a multiplier, campaign symbol, or ‘Points’.`} />
    <TooltipDescription text={t`Points are tracked separately and are not included in APY calculations.`} />
  </TooltipWrapper>
)
