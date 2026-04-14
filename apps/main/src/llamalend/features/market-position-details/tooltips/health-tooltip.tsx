import { TooltipDescription, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'

const HealthTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`Health shows your cushion before hard liquidation. Higher is safer; below 0 means hard liquidation is possible.`}
    />
    <TooltipDescription
      text={t`Unlike on standard lending apps, LLAMMA rebalancing can change health in both directions once your position is in the liquidation range. Monitor it together with the liquidation range.`}
    />
  </TooltipWrapper>
)

export const HEALTH_TOOLTIP = {
  title: t`Health`,
  body: <HealthTooltipContent />,
  placement: 'top',
} as const
