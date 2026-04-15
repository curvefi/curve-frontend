import { TooltipDescription, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import Box from '@mui/material/Box'
import { t, Trans } from '@ui-kit/lib/i18n'

const HealthTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Health shows your cushion before hard liquidation.`} />
    <TooltipDescription
      text={
        <Trans>
          Higher is safer;{' '}
          <Box component="span" sx={{ color: 'text.highlight' }}>
            below 0 means hard liquidation is possible.
          </Box>
        </Trans>
      }
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
