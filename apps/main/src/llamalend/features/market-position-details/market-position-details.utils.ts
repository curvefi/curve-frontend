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
  theme: {
    design: { Text },
  },
  isFullRepay,
  health,
  prevHealth,
}: {
  health: Decimal | null | undefined
  prevHealth?: Decimal
  isFullRepay?: boolean
  theme: Theme
  colorBackground?: boolean
}) => {
  const red = Text.TextColors.Feedback.Error
  const orange = Text.TextColors.Feedback.Danger
  const green = Text.TextColors.Feedback.Success
  const neutral = Text.TextColors.Primary

  if (health != null && prevHealth != null) {
    if (Number(health) < Number(prevHealth)) {
      return red
    }
    if (Number(health) > Number(prevHealth)) {
      return green
    }
  }
  const value = Number(health ?? prevHealth ?? 0)
  if (isFullRepay) return neutral
  if (value < HEALTH_THRESHOLDS.CRITICAL) return red
  if (value < HEALTH_THRESHOLDS.RISKY) return orange
  if (value < HEALTH_THRESHOLDS.GOOD) return neutral
  return neutral
}

export const getHealthTrackColor = ({
  health,
  softLiquidation,
  theme: {
    design: { Layer },
  },
}: {
  health: number | undefined | null
  softLiquidation: boolean | undefined | null
  theme: Theme
}) => {
  const red = Layer.Feedback.Error
  const yellow = Layer.Feedback.Warning
  const orange = Layer.Feedback.Danger
  const green = Layer.Feedback.Success

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
