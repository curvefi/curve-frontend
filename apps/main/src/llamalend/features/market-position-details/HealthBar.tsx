import { Stack, type SxProps, Typography, useTheme } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { LinearProgress } from '@ui-kit/shared/ui/LinearProgress'
import { getHealthTrackColor } from './'

type HealthBarProps = {
  health: number | undefined | null
  small?: boolean
  softLiquidation: boolean | undefined | null
  sx?: SxProps
}

type HealthLevel = 'hardLiquidation' | 'liquidation' | 'risky' | 'good' | 'pristine'

const BAR_HEIGHT = '2rem' // 36px
/** padding necesarry to mimic Metric components inherent line-height padding */
const TRACK_BOTTOM_PADDING = '0.1875rem' // 3px

const insetLabelText = {
  hardLiquidation: t`Liquidation protection disabled`,
  liquidation: t`Liquidation`,
  risky: t`Risky`,
  good: t`Good`,
  pristine: t`Pristine`,
} as const satisfies Record<HealthLevel, string>

const clampPercentage = (health: number | undefined | null): number => Math.max(0, Math.min(health ?? 0, 100))

const getHealthLevel = (health: number | undefined | null): HealthLevel => {
  if (health == null || health <= 0) return 'hardLiquidation'
  if (health <= 5) return 'liquidation'
  if (health <= 15) return 'risky'
  if (health <= 50) return 'good'
  return 'pristine'
}

export const HealthBar = ({ health, softLiquidation, small, sx }: HealthBarProps) => {
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
    <Stack paddingBottom={TRACK_BOTTOM_PADDING} sx={sx}>
      <Stack
        sx={{
          position: 'relative',
          width: '100%',
          height: BAR_HEIGHT,
          backgroundColor: (t) => t.design.Color.Neutral[300],
          transition: 'background-color 0.3s ease-in-out',
        }}
      >
        {/* Bar fills 100% when health <= 0 (hard liquidation) to indicate critical state. Always rendered for CSS transition. */}
        <Stack
          sx={{
            width: health != null ? `${health <= 0 ? 100 : clampPercentage(health)}%` : '0%',
            height: '100%',
            backgroundColor: health != null ? getHealthTrackColor({ health, softLiquidation, theme }) : 'transparent',
            transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out',
          }}
        />
        {/**
         * Text color logic for health bar label:
         *
         * - health <= 0: Bar is 100% red (hard liquidation), text is fully white
         * - 0 < health < 5: Split-color effect - black base with white overlay clipped to bar width.
         *   Two identical labels are stacked; the overlay uses overflow:hidden to show white
         *   text over the red bar and black text over the gray background.
         * - health >= 5: Single label in warning color
         */}
        {health != null && (
          <Typography
            variant="bodyXsRegular"
            sx={{
              position: 'absolute',
              bottom: '2px',
              left: '2px',
              color: (t) =>
                health <= 0
                  ? t.design.Text.TextColors.FilledFeedback.Alert.Primary // Full white when bar is 100% red
                  : health < 5
                    ? t.design.Text.TextColors.Primary // Black base for split effect
                    : t.design.Text.TextColors.FilledFeedback.Warning.Primary,
            }}
          >
            {insetLabelText[getHealthLevel(health)]}
          </Typography>
        )}
        {health != null && health < 5 && health > 0 && (
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
