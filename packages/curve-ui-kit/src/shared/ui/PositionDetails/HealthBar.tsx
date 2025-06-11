import { Box } from '@mui/material'
import { Reds, Blues } from '@ui-kit/themes/design/0_primitives'

type HealthBarProps = {
  health: number | undefined | null
}

const BAR_HEIGHT = '1.75rem'
const LINE_WIDTH = '0.25rem'

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

export const HealthBar = ({ health }: HealthBarProps) => {
  const healthPercentage = health ?? 0
  const trackColor = health != null && health < 5 ? Reds[500] : Blues[500]

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: BAR_HEIGHT,
        overflow: 'hidden',
        transition: 'background-color 0.3s ease-in-out',
        backgroundColor: (t) => t.design.Color.Neutral[300],
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
  )
}
