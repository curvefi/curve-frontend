import { Stack, Typography, useTheme } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { LinearProgress } from '@ui-kit/shared/ui/LinearProgress'
import { getHealthTrackColor } from './'

type HealthBarProps = {
  health: number | undefined | null
  small?: boolean
  softLiquidation: boolean | undefined | null
}

type HealthLevel = 'liquidation' | 'risky' | 'good' | 'pristine'

const BAR_HEIGHT = '2rem' // 36px
/** padding necesarry to mimic Metric components inherent line-height padding */
const TRACK_BOTTOM_PADDING = '0.1875rem' // 3px

const insetLabelText = {
  liquidation: t`Liquidation`,
  risky: t`Risky`,
  good: t`Good`,
  pristine: t`Pristine`,
} as const satisfies Record<HealthLevel, string>

const clampPercentage = (health: number | undefined | null): number => Math.max(0, Math.min(health ?? 0, 100))

const getHealthLevel = (health: number | undefined | null): HealthLevel => {
  if (health == null || health <= 0) return 'liquidation'
  if (health <= 15) return 'risky'
  if (health <= 50) return 'good'
  return 'pristine'
}

export const HealthBar = ({ health, softLiquidation, small }: HealthBarProps) => {
  const theme = useTheme()
  // Clamps health percentage between 0 and 100
  return small ? (
    health != null && (
      <LinearProgress
        percent={clampPercentage(health)}
        size="medium"
        barColor={getHealthTrackColor({ health, softLiquidation, theme })}
      />
    )
  ) : (
    <Stack paddingBottom={TRACK_BOTTOM_PADDING}>
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
            backgroundColor: getHealthTrackColor({ health, softLiquidation, theme }),
            transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out',
          }}
        />
        {/**
         * Split-color text effect for critical health (< 5%):
         *
         * When health drops below 5%, the bar is red and needs white text for contrast.
         * To handle text that spans beyond the red bar onto the gray background, we stack
         * two identical labels: a black base layer and a white overlay. The overlay is
         * wrapped in a container with overflow:hidden matching the bar width, so white
         * text shows over red and black text shows over gray.
         *
         * For non-critical health (>= 5%), only the base label renders in warning color.
         */}
        <Typography
          variant="bodyXsRegular"
          sx={{
            position: 'absolute',
            bottom: '2px',
            left: '2px',
            color: (t) =>
              health != null && health < 5
                ? t.design.Text.TextColors.Primary
                : t.design.Text.TextColors.FilledFeedback.Warning.Primary,
          }}
        >
          {insetLabelText[getHealthLevel(health)]}
        </Typography>
        {health != null && health < 5 && (
          <Stack
            sx={{
              position: 'absolute',
              bottom: '2px',
              left: '2px',
              width: `calc(${clampPercentage(health)}% - 2px)`,
              overflow: 'hidden',
            }}
          >
            <Typography
              variant="bodyXsRegular"
              sx={{ color: (t) => t.design.Text.TextColors.FilledFeedback.Alert.Primary, whiteSpace: 'nowrap' }}
            >
              {insetLabelText[getHealthLevel(health)]}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
