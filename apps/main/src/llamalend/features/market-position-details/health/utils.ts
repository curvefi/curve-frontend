import { useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import { QueryData } from '@evm-ui/lib'
import type { Theme } from '@mui/material/styles'
import { Decimal } from '@primitives/decimal.utils'
import { type Nullish, maybe, maybes, recordEntries, recordValues } from '@primitives/objects.utils'

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
  critical: 10,
  /** Below this value the position is risky. Above it is light */
  risky: 100,
} as const

export const clampPercentage = (health: number | Nullish): number => Math.max(0, Math.min(health ?? 0, 100))

export const getHealthState = (health: number): HealthState =>
  recordEntries(HEALTH_THRESHOLDS).find(([, threshold]) => health <= threshold)?.[0] ?? HEALTH_UPPER_BOUND_STATE

export const getLiquidationBufferState = (liquidationBuffer: number): LiquidationBufferState =>
  recordEntries(LIQUIDATION_BUFFER_THRESHOLDS).find(([, threshold]) => liquidationBuffer <= threshold)?.[0] ??
  LIQ_BUFFER_UPPER_BOUND_STATE

type FeedbackKey = keyof Theme['design']['Layer']['Feedback'] & keyof Theme['design']['Text']['TextColors']['Feedback']

const HEALTH_FEEDBACK_KEY = {
  pristine: 'Info',
  good: 'Success',
  caution: 'Caution',
  tight: 'Error',
  softLiquidation: 'Error',
} as const satisfies Record<HealthState, FeedbackKey>

const LIQUIDATION_BUFFER_FEEDBACK_KEY = {
  light: 'Info',
  risky: 'Warning',
  critical: 'Error',
  hardLiquidation: 'Error',
} as const satisfies Record<LiquidationBufferState, FeedbackKey>

/** Bar fills. Text uses `getHealthTextColor`. */
export const getHealthColor = (state: HealthState | undefined) => (theme: Theme) =>
  maybe(state, s => theme.design.Layer.Feedback[HEALTH_FEEDBACK_KEY[s]])

export const getHealthTextColor = (state: HealthState | undefined) => (theme: Theme) =>
  maybe(state, s => theme.design.Text.TextColors.Feedback[HEALTH_FEEDBACK_KEY[s]])

/** Bar fills. Text uses `getLiquidationBufferTextColor`. */
export const getLiquidationBufferColor = (state: LiquidationBufferState | undefined) => (theme: Theme) =>
  maybe(state, s => theme.design.Layer.Feedback[LIQUIDATION_BUFFER_FEEDBACK_KEY[s]])

export const getLiquidationBufferTextColor = (state: LiquidationBufferState | undefined) => (theme: Theme) =>
  maybe(state, s => theme.design.Text.TextColors.Feedback[LIQUIDATION_BUFFER_FEEDBACK_KEY[s]])

export const getHealthPercent = (health: Decimal | Nullish) =>
  health == null ? 0 : clampPercentage((+health / recordValues(HEALTH_THRESHOLDS).at(-1)!) * 100)

export const getLiquidationBufferPercent = (liquidationBuffer: Decimal | Nullish) =>
  liquidationBuffer == null
    ? 0
    : clampPercentage((+liquidationBuffer / recordValues(LIQUIDATION_BUFFER_THRESHOLDS).at(-1)!) * 100)

export const getHealthDetailsState = (healthData: QueryData<typeof useUserHealthValues> | undefined) => {
  const { health, liquidationBuffer } = healthData ?? {}
  // it returns the current type of the position, to either show the "health" or the "liquidationBuffer"
  const type: HealthType =
    maybes([liquidationBuffer, health], (lb, h) =>
      +lb <= LIQUIDATION_BUFFER_THRESHOLDS.hardLiquidation || +h <= HEALTH_THRESHOLDS.softLiquidation
        ? 'liquidationBuffer'
        : 'health',
    ) ?? 'health'

  const states = maybes(
    [health, liquidationBuffer],
    (health, liquidationBuffer) =>
      ({
        health: getHealthState(+health),
        liquidationBuffer: getLiquidationBufferState(+liquidationBuffer),
      }) satisfies Record<HealthType, HealthAndBufferState>,
  )

  return { state: states?.[type], healthState: states?.health, liquidationBufferState: states?.liquidationBuffer, type }
}
