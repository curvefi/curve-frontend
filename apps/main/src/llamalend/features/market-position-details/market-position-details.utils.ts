import type { Theme } from '@mui/material'
import type { Decimal } from '@primitives/decimal.utils'
import type { Nullish } from '@primitives/objects.utils'

/** Health percentage thresholds used for color coding and label display */
export const HEALTH_THRESHOLDS = {
  /** Below this value, the position is in hard liquidation */
  HARD_LIQUIDATION: 0,
  /** Below this value, the position is critically at risk */
  CRITICAL: 2.5,
  /** Below this value, the position is considered risky */
  RISKY: 15,
  /** Below this value during soft liquidation, the track color is orange */
  SOFT_LIQUIDATION_DANGER: 40,
  /** Below this value, the position is in good standing; above is pristine */
  GOOD: 50,
} as const

type HealthColorRole = 'fill' | 'text'
type HealthFeedbackKey = 'Error' | 'Warning' | 'Danger' | 'Success'

const healthFeedbackColor = (theme: Theme, role: HealthColorRole, key: HealthFeedbackKey) =>
  role === 'fill' ? theme.design.Layer.Feedback[key] : theme.design.Text.TextColors.Feedback[key]

const resolveHealthFeedbackKey = ({
  health,
  softLiquidation,
  isFullRepay,
}: {
  health: number | Nullish
  softLiquidation?: boolean | null
  isFullRepay?: boolean
}): HealthFeedbackKey => {
  if (isFullRepay) return 'Success'
  if (health == null) return softLiquidation ? 'Warning' : 'Success'
  if (softLiquidation) {
    if (health < HEALTH_THRESHOLDS.CRITICAL) return 'Error'
    if (health < HEALTH_THRESHOLDS.SOFT_LIQUIDATION_DANGER) return 'Danger'
    return 'Warning'
  }
  if (health < HEALTH_THRESHOLDS.CRITICAL) return 'Error'
  if (health < HEALTH_THRESHOLDS.RISKY) return 'Danger'
  if (health < HEALTH_THRESHOLDS.GOOD) return 'Warning'
  return 'Success'
}

export const getHealthValueColor = ({
  theme,
  isFullRepay,
  health,
  prevHealth,
}: {
  health: Decimal | Nullish
  prevHealth?: Decimal | null
  isFullRepay?: boolean
  theme: Theme
  colorBackground?: boolean
}) => {
  const value = health ?? prevHealth
  return healthFeedbackColor(
    theme,
    'text',
    resolveHealthFeedbackKey({ health: value == null ? value : Number(value), isFullRepay }),
  )
}

/** Bar and track fills. Health figures use `getHealthValueColor`. */
export const getHealthTrackColor = ({
  health,
  softLiquidation,
  theme,
  isFullRepay,
}: {
  health: number | Nullish
  softLiquidation?: boolean | null
  isFullRepay?: boolean
  theme: Theme
}) => healthFeedbackColor(theme, 'fill', resolveHealthFeedbackKey({ health, softLiquidation, isFullRepay }))
