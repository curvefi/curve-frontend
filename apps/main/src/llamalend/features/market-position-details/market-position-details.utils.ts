import type { Theme } from '@mui/material'
import type { Decimal } from '@primitives/decimal.utils'

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

export const calculateRangeToLiquidation = (upperLiquidationPrice: number, oraclePrice: number) =>
  ((oraclePrice - upperLiquidationPrice) / upperLiquidationPrice) * 100

export const getHealthValueColor = ({
  theme,
  isFullRepay,
  health,
  prevHealth,
}: {
  health: Decimal | null | undefined
  prevHealth?: Decimal | null
  isFullRepay?: boolean
  theme: Theme
  colorBackground?: boolean
}) => {
  const value = health ?? prevHealth
  return getHealthTrackColor({ health: value == null ? value : Number(value), isFullRepay, theme })
}

export const getHealthTrackColor = ({
  health,
  softLiquidation,
  theme: {
    design: { Layer },
  },
  isFullRepay,
}: {
  health: number | undefined | null
  softLiquidation?: boolean | null
  isFullRepay?: boolean
  theme: Theme
}) => {
  const red = Layer.Feedback.Error
  const yellow = Layer.Feedback.Warning
  const orange = Layer.Feedback.Danger
  const green = Layer.Feedback.Success

  if (isFullRepay) return green
  if (health == null) {
    return softLiquidation ? Layer.Feedback.Warning : green
  }
  if (softLiquidation) {
    if (health < HEALTH_THRESHOLDS.CRITICAL) return red
    if (health < HEALTH_THRESHOLDS.SOFT_LIQUIDATION_DANGER) return orange
    return yellow
  }
  if (health < HEALTH_THRESHOLDS.CRITICAL) return red
  if (health < HEALTH_THRESHOLDS.RISKY) return orange
  if (health < HEALTH_THRESHOLDS.GOOD) return yellow
  return green
}
