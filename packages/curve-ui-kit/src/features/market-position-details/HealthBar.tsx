import { Box, Typography, type Theme } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { Reds, Blues } from '@ui-kit/themes/design/0_primitives'

type HealthBarProps = {
  health: number | undefined | null
}

const BAR_HEIGHT = '1.4375rem' // 23px
const LINE_WIDTH = '0.25rem' // 4px
const LABEL_GAP = '0.125rem' // 2px

type LineColor = 'red' | 'orange' | 'green' | 'dark-green'

const getLineColor = (color: LineColor) => (t: Theme) =>
  ({
    red: t.design.Color.Tertiary[600],
    orange: t.design.Color.Tertiary[400],
    ['dark-green']: t.design.Color.Secondary[600],
    green: t.design.Color.Secondary[500],
  })[color]

const Line = ({ first, position, color }: { first?: boolean; position: string; color: LineColor }) => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: first ? '0' : `calc(${position} - (${LINE_WIDTH} / 2))`,
      width: LINE_WIDTH,
      height: '100%',
      backgroundColor: getLineColor(color),
    }}
  />
)

const Label = ({
  first,
  last,
  position,
  text,
}: {
  first?: boolean
  last?: boolean
  position: string
  text: string
}) => (
  <Box
    sx={{
      position: 'absolute',
      left: first || last ? position : `calc(${position} - (${LINE_WIDTH} / 2))`,
      top: 0,
      transform: last ? 'translateX(-100%)' : 'none',
    }}
  >
    <Typography variant="bodyXsRegular" color="textTertiary" sx={{ whiteSpace: 'nowrap' }}>
      {text}
    </Typography>
  </Box>
)

export const HealthBar = ({ health }: HealthBarProps) => {
  // Clamps health percentage between 0 and 100
  const healthPercentage = Math.max(0, Math.min(health ?? 0, 100))
  const trackColor = health != null && health < 5 ? Reds[500] : Blues[500]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: LABEL_GAP }} paddingBottom="0.3125rem">
      <Box sx={{ display: 'flex', position: 'relative', width: '100%', height: '1rem' }}>
        <Label first position="0%" text={t`liquidation`} />
        <Label position="15%" text={t`risky`} />
        <Label position="50%" text={t`good`} />
        <Label last position="100%" text={t`pristine`} />
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
        <Line first position="0%" color={'red'} />
        <Line position="15%" color={'orange'} />
        <Line position="50%" color={'green'} />
        <Line position="100%" color={'dark-green'} />
      </Box>
    </Box>
  )
}
