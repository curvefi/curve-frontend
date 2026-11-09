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
   * Share of the starting buffer still left: liquidationBuffer ÷ startingBuffer, where
   * startingBuffer = ((100 − liquidationDiscount) / (100 − loanDiscount) − 1) × 100, in % of debt.
   * Every loan action re-places the bands so the collateral covers the debt after the loan discount.
   * Measured with the smaller liquidation discount, the buffer restarts near startingBuffer, then interest shrinks it.
   * 1 means a fresh position. 0 means the liquidation price has reached the top of the range.
   * Thresholds use this share because startingBuffer ranges from under 1% to over 25% between markets.
   */
  liquidationBufferLeft: Decimal
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
  /** {@link PositionHealth.liquidationBufferLeft} at or below which the position is critical */
  bufferLeftCritical: number
  /** {@link PositionHealth.liquidationBufferLeft} at or below which the position is risky */
  bufferLeftRisky: number
}

const HEALTH_THRESHOLDS = {
  [MarketAssetsType.Correlated]: {
    nearRangeHealth: 1.0101,
    healthBarFull: 1.0526,
    bufferLeftCritical: 0.1,
    bufferLeftRisky: 0.3,
  },
  [MarketAssetsType.BlueChip]: {
    nearRangeHealth: 1.0526,
    healthBarFull: 1.4286,
    bufferLeftCritical: 0.2,
    bufferLeftRisky: 0.45,
  },
  [MarketAssetsType.LongTail]: {
    nearRangeHealth: 1.1111,
    healthBarFull: 2,
    bufferLeftCritical: 0.3,
    bufferLeftRisky: 0.6,
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

/** Resolves the position status. */
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
  { liquidationBufferLeft, isLiquidatable }: PositionHealth,
  { bufferLeftCritical, bufferLeftRisky }: HealthThresholds,
): FeedbackKey =>
  isLiquidatable || +liquidationBufferLeft <= bufferLeftCritical
    ? 'Error'
    : +liquidationBufferLeft <= bufferLeftRisky
      ? 'Warning'
      : 'Success'

export const clampPercentage = (value: number | Nullish): number => Math.max(0, Math.min(value ?? 0, 100))

/** Fills by price drop to the range, so the bar is linear in price rather than in health. */
export const getHealthBarFill = ({ health }: PositionHealth, { healthBarFull }: HealthThresholds) =>
  clampPercentage(((1 - 1 / +health) / (1 - 1 / healthBarFull)) * 100)

export const getLiquidationBufferBarFill = ({ liquidationBufferLeft }: PositionHealth) =>
  clampPercentage(+liquidationBufferLeft * 100)
