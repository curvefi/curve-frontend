import { useUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import type { Theme } from '@mui/material/styles'
import { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { QueryData } from '@ui-kit/lib'

type HealthState = 'pristine' | 'good' | 'tight' | 'softLiquidation'
type LiquidationBufferState = 'risky' | 'critical' | 'hardLiquidation'
export type HealthAndBufferState = HealthState | LiquidationBufferState
export type HealthType = 'liquidationBuffer' | 'health'

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
  critical: 10,
} as const

export const clampPercentage = (health: number | undefined | null): number => Math.max(0, Math.min(health ?? 0, 100))

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

export const getHealthColor = (state: HealthAndBufferState | undefined) => (theme: Theme) => {
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

export const getLiquidationBufferColor = (state: HealthAndBufferState | undefined) => (theme: Theme) => {
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

export const getHealthPercent = (state: HealthAndBufferState | undefined, health: Decimal | null | undefined) => {
  if (health == null || state == null) return 0
  switch (state) {
    case 'pristine':
    case 'hardLiquidation':
      return 100
    case 'good':
    case 'tight':
      // TODO: get the last thresholds rather then hardcoding it
      return clampPercentage((+health / HEALTH_THRESHOLDS.good) * 100)
    default:
      return 0
  }
}

export const getLiquidationBufferPercent = (
  state: HealthAndBufferState | undefined,
  liquidationBuffer: Decimal | null | undefined,
) => {
  if (liquidationBuffer == null || state == null) return 0
  switch (state) {
    case 'risky':
    case 'critical':
      // TODO: get the last thresholds rather then hardcoding it
      return clampPercentage((+liquidationBuffer / LIQUIDATION_BUFFER_THRESHOLDS.critical) * 100)
    default:
      return 100
  }
}

export const getHealthDetailsState = (healthData: QueryData<typeof useUserHealthValue> | undefined) => {
  const { health, liquidationBuffer } = healthData ?? {}
  // it returns the current type of the position, to either show the "health" or the "liquidationBuffer"
  const type: HealthType =
    liquidationBuffer != null && health != null
      ? +liquidationBuffer <= LIQUIDATION_BUFFER_THRESHOLDS.hardLiquidation ||
        +health <= HEALTH_THRESHOLDS.softLiquidation
        ? 'liquidationBuffer'
        : 'health'
      : 'health'

  const state = maybes([health, liquidationBuffer], ([health, liquidationBuffer]) => {
    const stateByType = {
      health: getHealthState(+health),
      liquidationBuffer: getLiquidationBufferState(+liquidationBuffer),
    } satisfies Record<HealthType, HealthAndBufferState>

    return stateByType[type]
  })

  return { state, type }
}
