import { Box, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { Reds, Blues } from '@ui-kit/themes/design/0_primitives'

type HealthBarProps = {
  health: number | undefined | null
}

const BAR_HEIGHT = '1.4375rem'
const LINE_WIDTH = '0.25rem'
const LABEL_GAP = '6px'

const Line = ({ position, color }: { position: string; color: 'red' | 'orange' | 'green' }) => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: `calc(${position} - (${LINE_WIDTH} / 2))`,
      width: LINE_WIDTH,
      height: '100%',
      backgroundColor:
        color === 'red'
          ? (t) => t.design.Color.Tertiary[600]
          : color === 'orange'
            ? (t) => t.design.Color.Tertiary[400]
            : (t) => t.design.Color.Secondary[500],
    }}
  />
)

const Label = ({ position, text }: { position: string; text: string }) => (
  <Box
    sx={{
      width: 0,
      position: 'relative',
      left: `calc(${position} - (${LINE_WIDTH} / 2))`,
    }}
  >
    <Typography variant="bodyXsRegular" color="textTertiary">
      {text}
    </Typography>
  </Box>
)

export const HealthBar = ({ health }: HealthBarProps) => {
  const healthPercentage = Math.min(health ?? 0, 100)
  const trackColor = health != null && health < 5 ? Reds[500] : Blues[500]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: LABEL_GAP }} paddingBottom="7px">
      <Box sx={{ display: 'flex', position: 'relative', width: '100%' }}>
        <Label position="5%" text={t`risky`} />
        <Label position="25%" text={t`good`} />
        <Label position="75%" text={t`great`} />
      </Box>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: BAR_HEIGHT,
          backgroundColor: (t) => t.design.Color.Neutral[300],
          transition: 'background-color 0.3s ease-in-out',
        }}
      >
        <Box
          sx={{
            width: `${healthPercentage}%`,
            height: '100%',
            backgroundColor: trackColor,
            transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out',
          }}
        />
        <Line position="5%" color={'red'} />
        <Line position="25%" color={'orange'} />
        <Line position="75%" color={'green'} />
      </Box>
    </Box>
  )
}
