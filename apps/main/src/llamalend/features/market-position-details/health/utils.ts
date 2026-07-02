import { useUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import type { Theme } from '@mui/material/styles'
import { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes, recordEntries, recordValues } from '@primitives/objects.utils'
import { QueryData } from '@ui-kit/lib'

const HEALTH_UPPER_BOUND_STATE = 'pristine' as const
const LIQ_BUFFER_UPPER_BOUND_STATE = 'light' as const

type HealthState = typeof HEALTH_UPPER_BOUND_STATE | 'good' | 'caution' | 'tight' | 'softLiquidation'
type LiquidationBufferState = typeof LIQ_BUFFER_UPPER_BOUND_STATE | 'risky' | 'critical' | 'hardLiquidation'
export type HealthAndBufferState = HealthState | LiquidationBufferState
export type HealthType = 'liquidationBuffer' | 'health'

const HEALTH_THRESHOLDS: Record<Exclude<HealthState, typeof HEALTH_UPPER_BOUND_STATE>, number> = {
  /** Below this value the position enter soft liquidation */
  softLiquidation: 0,
  /** Below this value the position is tight */
  tight: 5,
  /** Below this value the position is caution */
  caution: 10,
  /** Below this value, the position is in good standing; above is pristine */
  good: 100,
} as const

const LIQUIDATION_BUFFER_THRESHOLDS: Record<
  Exclude<LiquidationBufferState, typeof LIQ_BUFFER_UPPER_BOUND_STATE>,
  number
> = {
  /** Below this value the position is hard liquidated */
  hardLiquidation: 0,
  /** Below this value the position is critical */
  critical: 2.5,
  /** Below this value the position is risky. Above it is light */
  risky: 25,
} as const

export const clampPercentage = (health: number | undefined | null): number => Math.max(0, Math.min(health ?? 0, 100))

const getHealthState = (health: number): HealthState =>
  recordEntries(HEALTH_THRESHOLDS).find(([, threshold]) => health <= threshold)?.[0] ?? HEALTH_UPPER_BOUND_STATE

const getLiquidationBufferState = (liquidationBuffer: number): LiquidationBufferState =>
  recordEntries(LIQUIDATION_BUFFER_THRESHOLDS).find(([, threshold]) => liquidationBuffer <= threshold)?.[0] ??
  LIQ_BUFFER_UPPER_BOUND_STATE

export const getHealthColor = (state: HealthAndBufferState | undefined) => (theme: Theme) => {
  const { Layer } = theme.design
  const colors = {
    pristine: Layer.Feedback.Success,
    good: Layer.Feedback.Success,
    caution: Layer.Feedback.Caution,
    tight: Layer.Feedback.Warning,
    softLiquidation: undefined,
    light: undefined,
    risky: undefined,
    critical: undefined,
    hardLiquidation: Layer.Feedback.Error,
  } satisfies Record<HealthAndBufferState, string | undefined>

  return maybe(state, s => colors[s])
}

export const getLiquidationBufferColor = (state: HealthAndBufferState | undefined) => (theme: Theme) => {
  const { Layer } = theme.design
  const colors = {
    pristine: Layer.Feedback.Success,
    good: Layer.Feedback.Success,
    caution: Layer.Feedback.Success,
    tight: Layer.Feedback.Success,
    softLiquidation: Layer.Feedback.Success,
    light: Layer.Feedback.Caution,
    risky: Layer.Feedback.Warning,
    critical: Layer.Feedback.Error,
    hardLiquidation: Layer.Feedback.Error,
  } satisfies Record<HealthAndBufferState, string | undefined>

  return maybe(state, s => colors[s])
}

export const getHealthPercent = (state: HealthAndBufferState | undefined, health: Decimal | null | undefined) => {
  if (health == null || state == null) return 0
  const healthPercent = clampPercentage((+health / recordValues(HEALTH_THRESHOLDS).at(-1)!) * 100)
  const percent = {
    pristine: 100,
    good: healthPercent,
    caution: healthPercent,
    tight: healthPercent,
    softLiquidation: 0,
    light: 0,
    risky: 0,
    critical: 0,
    hardLiquidation: 100,
  } satisfies Record<HealthAndBufferState, number>

  return percent[state]
}

export const getLiquidationBufferPercent = (
  state: HealthAndBufferState | undefined,
  liquidationBuffer: Decimal | null | undefined,
) => {
  if (liquidationBuffer == null || state == null) return 0
  const liquidationBufferPercent = clampPercentage(
    (+liquidationBuffer / recordValues(LIQUIDATION_BUFFER_THRESHOLDS).at(-1)!) * 100,
  )
  const percent = {
    pristine: 100,
    good: 100,
    caution: 100,
    tight: 100,
    softLiquidation: 100,
    light: 100,
    risky: liquidationBufferPercent,
    critical: liquidationBufferPercent,
    hardLiquidation: 100,
  } satisfies Record<HealthAndBufferState, number>

  return percent[state]
}

export const getHealthDetailsState = (healthData: QueryData<typeof useUserHealthValue> | undefined) => {
  const { health, liquidationBuffer } = healthData ?? {}
  // it returns the current type of the position, to either show the "health" or the "liquidationBuffer"
  const type: HealthType =
    maybes([liquidationBuffer, health], (lb, h) =>
      +lb <= LIQUIDATION_BUFFER_THRESHOLDS.hardLiquidation || +h <= HEALTH_THRESHOLDS.softLiquidation
        ? 'liquidationBuffer'
        : 'health',
    ) ?? 'health'

  const state = maybes([health, liquidationBuffer], (health, liquidationBuffer) => {
    const stateByType = {
      health: getHealthState(+health),
      liquidationBuffer: getLiquidationBufferState(+liquidationBuffer),
    } satisfies Record<HealthType, HealthAndBufferState>

    return stateByType[type]
  })

  return { state, type }
}
