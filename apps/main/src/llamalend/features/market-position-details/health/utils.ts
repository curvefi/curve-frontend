import type { Theme } from '@mui/material/styles'
import { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'

type HealthState = 'pristine' | 'good' | 'tight' | 'softLiquidation'
type LiquidationBufferState = 'risky' | 'critical' | 'hardLiquidation'
export type HealthAndBufferState = HealthState | LiquidationBufferState

// the base on wich to calculate the "percentage" of the liquidation buffer bar: liqudation_baffer / base
const LIQ_BUFFER_BASE_PERCENTAGE = 10
// the base on wich to calculate the "percentage" of the health bar: health / base
const HEALTH_BASE_PERCENTAGE = 100

const HEALTH_THRESHOLDS: Record<Exclude<HealthState, 'pristine'>, number> = {
  /** Below this value the position enter soft liquidation */
  softLiquidation: 0,
  /** Below this value the position is tight */
  tight: 20,
  /** Below this value, the position is in good standing; above is pristine */
  good: 50,
} as const

const LIQUIDATION_BUFFER_THRESHOLDS: Record<Exclude<LiquidationBufferState, 'risky'>, number> = {
  /** Below this value the position is hard liquidated */
  hardLiquidation: 0,
  /** Below this value the position is critical. Above it is risky */
  critical: 20,
} as const

export const clampPercent = (value: number) => Math.max(0, Math.min(value, 100))

export const getHealthState = (health: number): HealthState => {
  if (health > HEALTH_THRESHOLDS.good) return 'pristine'
  if (health > HEALTH_THRESHOLDS.tight) return 'good'
  if (health > HEALTH_THRESHOLDS.softLiquidation) return 'tight'
  return 'softLiquidation'
}

export const getLiquidationBufferState = (liquidationBuffer: number): LiquidationBufferState => {
  if (liquidationBuffer <= LIQUIDATION_BUFFER_THRESHOLDS.hardLiquidation) return 'hardLiquidation'
  if (liquidationBuffer < LIQUIDATION_BUFFER_THRESHOLDS.critical) return 'critical'
  return 'risky'
}

export const getHealthBarFillColor = (state: HealthAndBufferState) => (theme: Theme) => {
  const { Layer } = theme.design
  switch (state) {
    case 'pristine':
      return Layer.Feedback.Info
    case 'good':
      return Layer.Feedback.Success
    case 'tight':
      return Layer.Feedback.Caution
    case 'softLiquidation':
    case 'risky':
    case 'critical':
      return undefined
    case 'hardLiquidation':
      return Layer.Feedback.Error
  }
}

export const getLiquidationBufferBarFillColor = (state: HealthAndBufferState) => (theme: Theme) => {
  const { Layer } = theme.design
  switch (state) {
    case 'pristine':
    case 'good':
    case 'tight':
    case 'softLiquidation':
      return Layer.Feedback.Info
    case 'risky':
      return Layer.Feedback.Warning
    case 'critical':
    case 'hardLiquidation':
      return Layer.Feedback.Error
  }
}

/**
 * If `healthValue` is defined, it returns true if the position has not entered soft liquidation (health > 0), false if it has.
 * It returns undefined if the value is not defined
 */
export const getIsHealthy = (healthValue: Decimal | null | undefined) =>
  maybe(healthValue, healthValue => +healthValue > HEALTH_THRESHOLDS.softLiquidation)

export const getHealthPercent = (state: HealthAndBufferState, health: Decimal | null | undefined) => {
  if (health == null) return 100
  switch (state) {
    case 'pristine':
    case 'hardLiquidation':
      return 100
    case 'good':
    case 'tight':
      return clampPercent((+health / HEALTH_BASE_PERCENTAGE) * 100)
    default:
      return 0
  }
}

export const getLiquidationBufferPercent = (
  state: HealthAndBufferState,
  liquidationBuffer: Decimal | null | undefined,
) =>
  ['risky', 'critical'].includes(state) && liquidationBuffer
    ? clampPercent((+liquidationBuffer / LIQ_BUFFER_BASE_PERCENTAGE) * 100)
    : 100
