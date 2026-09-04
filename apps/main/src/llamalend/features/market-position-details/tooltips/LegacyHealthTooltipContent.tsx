import Box from '@mui/material/Box'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t, Trans } from '@ui/lib/i18n'

export const LegacyHealthTooltipContent = () => (
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
