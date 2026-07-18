import Box from '@mui/material/Box'
import { t, Trans } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'

export const HealthTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Health shows the cushion before your position enters liquidation protection.`} />
    <TooltipDescription
      text={
        <Trans>
          Higher is safer;{' '}
          <Box component="span" sx={{ color: 'text.highlight' }}>
            when at 0 liquidation protection has started.
          </Box>
        </Trans>
      }
    />
    <TooltipDescription
      text={t`Once Health reaches 0, monitor the liquidation buffer to track your position before hard liquidation.`}
    />
  </TooltipWrapper>
)
