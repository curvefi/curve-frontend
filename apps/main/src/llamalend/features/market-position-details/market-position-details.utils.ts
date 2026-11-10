import type { Theme } from '@mui/material'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'
import {
  decimalDiv,
  decimalGreaterThan,
  decimalMax,
  decimalMinus,
  decimalPercent,
  decimalSum,
  ZERO,
} from '@ui/lib/decimal'

export const BORROW_METRIC_CATEGORY = 'llamalend.positionBorrowDetails'
export const BORROW_METRIC_TOOLTIP = { placement: 'top', arrow: false, clickable: true } as const

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

const healthFeedbackColors = (theme: Theme, role: HealthColorRole) =>
  role === 'fill' ? theme.design.Layer.Feedback : theme.design.Text.TextColors.Feedback

type HealthFeedbackKey = keyof ReturnType<typeof healthFeedbackColors>

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
  return healthFeedbackColors(theme, 'text')[
    resolveHealthFeedbackKey({ health: value == null ? value : Number(value), isFullRepay })
  ]
}

export const getLeverageValueColor = (leverage: Decimal | Nullish) =>
  leverage != null && decimalGreaterThan(ZERO, leverage) ? 'error' : undefined

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
}) => healthFeedbackColors(theme, 'fill')[resolveHealthFeedbackKey({ health, softLiquidation, isFullRepay })]

/** Distance from hard liquidation as a percentage of the gap between the loan and liquidation discounts, all in percent. */
export const getLiquidationBuffer = (healthNotFull: Decimal, loanDiscount: Decimal, liquidationDiscount: Decimal) => {
  const discountGap = decimalMinus(loanDiscount, liquidationDiscount)
  return decimalGreaterThan(discountGap, ZERO) ? decimalPercent(healthNotFull, discountGap) : undefined
}

const HEALTH_PRECISION_THRESHOLD = 1.1

export const formatHealthFactor = (healthFactor: Decimal | number | undefined) =>
  formatNumber(healthFactor, Number(healthFactor) < HEALTH_PRECISION_THRESHOLD ? 'health.precise' : 'health')

/** Health of a position from its full and band-valued health, both in percent of the debt. */
export const getHealthValues = (healthFull: Decimal, healthNotFull: Decimal) => {
  const healthDelta = decimalMinus(healthFull, healthNotFull)
  // Clamping at zero because separate RPC calls can resolve from different blocks and return a negative delta
  // which shouldn't be possible
  const health = decimalMax(healthDelta, ZERO)!
  return {
    healthDelta,
    /** Percentage distance from entering liquidation protection: the above-band cushion, clamped at zero. */
    health,
    /**
     * Ratio of the above-band cushion plus debt to the debt amount.
     * A health factor of 1 marks the entry into liquidation protection (soft liquidation).
     * The +1 is equivalent to adding debt / debt, similar to how other lending platforms display health.
     */
    healthFactor: decimalSum('1', decimalDiv(health, '100')),
  }
}
