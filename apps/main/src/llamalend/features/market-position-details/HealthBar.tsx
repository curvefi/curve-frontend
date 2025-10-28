import { Box, Stack, type Theme, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { LinearProgress } from '@ui-kit/shared/ui/LinearProgress'
import { getHealthTrackColor } from './utils'

type HealthBarProps = {
  health: number | undefined | null
  small?: boolean
  softLiquidation: boolean | undefined | null
}

const BAR_HEIGHT = '1.4375rem' // 23px
const LINE_WIDTH = '0.25rem' // 4px
const LABEL_GAP = '0.125rem' // 2px
const TRACK_BOTTOM_PADDING = '0.3125rem' // 5px

type LineColor = 'red' | 'orange' | 'green' | 'dark-green'

const LinePositions = {
  liquidation: '0%',
  risky: '15%',
  good: '50%',
  pristine: '100%',
} as const

const labels = [
  { position: LinePositions.liquidation, text: t`liquidation`, mobileText: t`liq` },
  { position: LinePositions.risky, text: t`risky` },
  { position: LinePositions.good, text: t`good` },
  { position: LinePositions.pristine, text: t`pristine` },
]

const lines: Array<{ position: string; color: LineColor }> = [
  { position: LinePositions.liquidation, color: 'red' },
  { position: LinePositions.risky, color: 'orange' },
  { position: LinePositions.good, color: 'green' },
  { position: LinePositions.pristine, color: 'dark-green' },
]

const getLineColor = (color: LineColor) => (t: Theme) =>
  ({
    red: t.design.Color.Tertiary[600],
    orange: t.design.Color.Tertiary[400],
    ['dark-green']: t.design.Color.Secondary[600],
    green: t.design.Color.Secondary[500],
  })[color]

const Line = ({ position, color }: { position: string; color: LineColor }) => (
  <Stack
    sx={{
      position: 'absolute',
      top: 0,
      left: `calc(${position} - (${LINE_WIDTH} / 2))`,
      width: LINE_WIDTH,
      height: '100%',
      backgroundColor: getLineColor(color),
      '&:first-child': {
        left: '0',
      },
    }}
  />
)

const Label = ({
  position,
  text,
  mobileText,
}: {
  position: string
  text: string
  mobileText?: string // if mobileText is provided, it will replace text on mobile
}) => (
  <Stack
    sx={{
      position: 'absolute',
      left: `calc(${position} - (${LINE_WIDTH} / 2))`,
      top: 0,
      '&:first-child': {
        left: position,
      },
      '&:last-child': {
        left: position,
        transform: 'translateX(-100%)',
      },
    }}
  >
    <Typography variant="bodyXsRegular" color="textTertiary" sx={{ whiteSpace: 'nowrap' }}>
      <Box component="span" sx={mobileText ? { display: { mobile: 'none', tablet: 'inline' } } : undefined}>
        {text}
      </Box>
      {mobileText && (
        <Box component="span" sx={{ display: { mobile: 'inline', tablet: 'none' } }}>
          {mobileText}
        </Box>
      )}
    </Typography>
  </Stack>
)

const clampPercentage = (health: number | undefined | null) => Math.max(0, Math.min(health ?? 0, 100))

export const HealthBar = ({ health, softLiquidation, small }: HealthBarProps) =>
  // Clamps health percentage between 0 and 100
  small ? (
    health != null && (
      <LinearProgress
        percent={clampPercentage(health)}
        size="medium"
        barColor={getHealthTrackColor(health, softLiquidation)}
      />
    )
  ) : (
    <Stack sx={{ gap: LABEL_GAP }} paddingBottom={TRACK_BOTTOM_PADDING}>
      <Stack flexDirection="row" sx={{ position: 'relative', width: '100%', height: '1rem' }}>
        {labels.map((label, index) => (
          <Label key={index} position={label.position} text={label.text} mobileText={label.mobileText} />
        ))}
      </Stack>
      <Stack
        sx={{
          position: 'relative',
          width: '100%',
          height: BAR_HEIGHT,
          backgroundColor: (t) => t.design.Color.Neutral[300],
          transition: 'background-color 0.3s ease-in-out',
        }}
      >
        <Stack
          sx={{
            width: `${clampPercentage(health)}%`,
            height: '100%',
            backgroundColor: getHealthTrackColor(health, softLiquidation),
            transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out',
          }}
        />
        {lines.map((line, index) => (
          <Line key={index} position={line.position} color={line.color} />
        ))}
      </Stack>
    </Stack>
  )
