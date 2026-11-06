import type { Theme } from '@mui/material/styles'
import type { Amount, Decimal } from '@primitives/decimal.utils'
import { MarketAssetsType } from '@primitives/llamalend/markets.constants'
import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'
import type { Range } from '@ui/features/queries/util'
import { decimalDiv, decimalGreaterThan, decimalMax } from '@ui/lib/decimal'

export type PositionStatus = 'liquidatable' | 'inRange' | 'belowRange' | 'nearRange' | 'aboveRange'

export type PositionHealth = {
  /**
   * How far the oracle price is above the liquidation range: oracle price ÷ top of the range, floored at 1.
   * 1.00 means the price has reached the range and soft liquidation can start.
   * The price can fall by 1 − 1/health before that happens.
   */
  health: Decimal
  /**
   * Margin left once the price reaches the top of the range, as a % of debt.
   * Inside or below the range it is the margin before hard liquidation.
   * At 0% or below, the position becomes liquidatable before the price reaches the range.
   * This is the Controller's `health(user, full=false)`.
   */
  liquidationBuffer: Decimal
  /** The liquidation buffer in the borrow token: debt × liquidationBuffer / 100. */
  liquidationBufferAmount: Decimal
  /**
   * Whether anyone can hard-liquidate the position now.
   * Same check as the Controller's `liquidate()`: full health below 0.
   */
  isLiquidatable: boolean
  status: PositionStatus
}

export type HealthThresholds = {
  /** Above the range, a health at or below this reads as near range */
  nearRangeHealth: number
  /** Health at which the health bar is full */
  healthBarFull: number
  /** Liquidation buffer (% of debt) at or below which the position is critical */
  bufferCritical: number
  /** Liquidation buffer (% of debt) at or below which the position is risky */
  bufferRisky: number
  /** Liquidation buffer (% of debt) at which the buffer bar is full */
  bufferBarFull: number
}

/** Provisional values, the comments give the price drop matching each health. */
const HEALTH_THRESHOLDS = {
  [MarketAssetsType.Correlated]: {
    nearRangeHealth: 1.0101, // 1%
    healthBarFull: 1.0526, // 5%
    bufferCritical: 1,
    bufferRisky: 3,
    bufferBarFull: 5,
  },
  [MarketAssetsType.BlueChip]: {
    nearRangeHealth: 1.0526, // 5%
    healthBarFull: 1.4286, // 30%
    bufferCritical: 2,
    bufferRisky: 5,
    bufferBarFull: 15,
  },
  [MarketAssetsType.LongTail]: {
    nearRangeHealth: 1.1111, // 10%
    healthBarFull: 2, // 50%
    bufferCritical: 3,
    bufferRisky: 10,
    bufferBarFull: 25,
  },
} as const satisfies Record<MarketAssetsType, HealthThresholds>

/** Thresholds for the market's assets type. Unmapped markets use the long-tail ones. */
export const getHealthThresholds = (assetsType: MarketAssetsType | undefined): HealthThresholds =>
  HEALTH_THRESHOLDS[assetsType ?? MarketAssetsType.LongTail]

/** Computes {@link PositionHealth.health} from the user's `[low, high]` liquidation range prices. */
export const getHealth = (oraclePrice: Decimal, [, topOfRange]: Range<Decimal>): Decimal =>
  decimalMax(decimalDiv(oraclePrice, topOfRange), '1')!

/** Below this health, values near 1 need more decimals than the 3 significant digits of the `health` format */
const HEALTH_PRECISION_THRESHOLD = 1.1

export const formatHealth = (health: Amount) =>
  formatNumber(health, +health < HEALTH_PRECISION_THRESHOLD ? 'health.precise' : 'health')

/** Resolves the position status, the first match wins. */
export const getPositionStatus = ({
  health,
  isLiquidatable,
  oraclePrice,
  prices: [bottom, top],
  thresholds: { nearRangeHealth },
}: Pick<PositionHealth, 'health' | 'isLiquidatable'> & {
  oraclePrice: Decimal
  prices: Range<Decimal>
  thresholds: HealthThresholds
}): PositionStatus =>
  isLiquidatable
    ? 'liquidatable'
    : decimalGreaterThan(bottom, oraclePrice)
      ? 'belowRange'
      : decimalGreaterThan(oraclePrice, top)
        ? +health <= nearRangeHealth
          ? 'nearRange'
          : 'aboveRange'
        : 'inRange'

export type FeedbackKey = keyof Theme['design']['Layer']['Feedback'] &
  keyof Theme['design']['Text']['TextColors']['Feedback']

export const getHealthFeedback = ({ health }: PositionHealth, { nearRangeHealth }: HealthThresholds): FeedbackKey =>
  decimalGreaterThan(health, '1') ? (+health <= nearRangeHealth ? 'Warning' : 'Success') : 'Error'

export const getLiquidationBufferFeedback = (
  { liquidationBuffer, isLiquidatable }: PositionHealth,
  { bufferCritical, bufferRisky }: HealthThresholds,
): FeedbackKey =>
  isLiquidatable || +liquidationBuffer <= bufferCritical
    ? 'Error'
    : +liquidationBuffer <= bufferRisky
      ? 'Warning'
      : 'Success'

export const clampPercentage = (value: number | Nullish): number => Math.max(0, Math.min(value ?? 0, 100))

/** Fills by price drop to the range, so the bar is linear in price rather than in health. */
export const getHealthBarFill = ({ health }: PositionHealth, { healthBarFull }: HealthThresholds) =>
  clampPercentage(((1 - 1 / +health) / (1 - 1 / healthBarFull)) * 100)

export const getLiquidationBufferBarFill = (
  { liquidationBuffer }: PositionHealth,
  { bufferBarFull }: HealthThresholds,
) => clampPercentage((+liquidationBuffer / bufferBarFull) * 100)
