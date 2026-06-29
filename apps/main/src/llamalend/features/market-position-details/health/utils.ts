import { useUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import type { Theme } from '@mui/material/styles'
import { Decimal } from '@primitives/decimal.utils'
import { maybes, recordEntries } from '@primitives/objects.utils'
import { QueryData } from '@ui-kit/lib'

type HealthState = 'pristine' | 'good' | 'caution' | 'tight' | 'softLiquidation'
type LiquidationBufferState = 'light' | 'risky' | 'critical' | 'hardLiquidation'
export type HealthAndBufferState = HealthState | LiquidationBufferState
export type HealthType = 'liquidationBuffer' | 'health'

const HEALTH_THRESHOLDS: Record<Exclude<HealthState, 'pristine'>, number> = {
  /** Below this value the position enter soft liquidation */
  softLiquidation: 0,
  /** Below this value the position is tight */
  tight: 5,
  /** Below this value the position is caution */
  caution: 10,
  /** Below this value, the position is in good standing; above is pristine */
  good: 100,
} as const

const LIQUIDATION_BUFFER_THRESHOLDS: Record<Exclude<LiquidationBufferState, 'light'>, number> = {
  /** Below this value the position is hard liquidated */
  hardLiquidation: 0,
  /** Below this value the position is critical */
  critical: 2.5,
  /** Below this value the position is risky. Above it is light */
  risky: 25,
} as const

export const clampPercentage = (health: number | undefined | null): number => Math.max(0, Math.min(health ?? 0, 100))

export const getHealthState = (health: number): HealthState =>
  recordEntries(HEALTH_THRESHOLDS).find(([, threshold]) => health <= threshold)?.[0] ?? 'pristine'

export const getLiquidationBufferState = (liquidationBuffer: number): LiquidationBufferState =>
  recordEntries(LIQUIDATION_BUFFER_THRESHOLDS).find(([, threshold]) => liquidationBuffer <= threshold)?.[0] ?? 'light'

export const getHealthColor = (state: HealthAndBufferState | undefined) => (theme: Theme) => {
  const { Layer } = theme.design
  switch (state) {
    case 'pristine':
      return Layer.Feedback.Success
    case 'good':
      return Layer.Feedback.Success
    case 'caution':
      return Layer.Feedback.Caution
    case 'tight':
      return Layer.Feedback.Warning
    case 'softLiquidation':
    case 'light':
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
    case 'caution':
    case 'tight':
    case 'softLiquidation':
      return Layer.Feedback.Success
    case 'light':
      return Layer.Feedback.Caution
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
    case 'caution':
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
      return clampPercentage((+liquidationBuffer / LIQUIDATION_BUFFER_THRESHOLDS.risky) * 100)
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
