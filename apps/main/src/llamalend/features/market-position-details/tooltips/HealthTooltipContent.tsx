import { TooltipDescription, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import Box from '@mui/material/Box'
import { t, Trans } from '@ui-kit/lib/i18n'

export const HealthTooltipContent = ({ variant = 'bar' }: { variant?: 'bar' | 'metric' }) => {
  const boundary = variant === 'metric' ? t`when at 1` : t`when the bar is empty`
  const liquidationBufferBoundary = variant === 'metric' ? t`Health reaches 1` : t`the bar is empty`

  return (
    <TooltipWrapper>
      <TooltipDescription text={t`Health shows the cushion before your position enters liquidation protection.`} />
      <TooltipDescription
        text={
          <Trans>
            Higher is safer;{' '}
            <Box component="span" sx={{ color: 'text.highlight' }}>
              {boundary} liquidation protection has started.
            </Box>
          </Trans>
        }
      />
      <TooltipDescription
        text={t`Once ${liquidationBufferBoundary}, monitor the liquidation buffer to track your position before hard liquidation.`}
      />
    </TooltipWrapper>
  )
}
