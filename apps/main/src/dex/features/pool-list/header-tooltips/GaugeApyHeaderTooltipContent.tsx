import { t } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'

export const GaugeApyHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`CRV gauge reward APY shown from the unboosted rate to the maximum boosted rate.`} />
    <TooltipDescription text={t`The maximum rate assumes the full 2.5x gauge boost.`} />
    <TooltipDescription
      text={t`The range is unavailable for inactive gauges or when either rate is missing or zero.`}
    />
  </TooltipWrapper>
)
