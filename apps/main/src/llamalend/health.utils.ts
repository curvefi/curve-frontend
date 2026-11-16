import type { Theme } from '@mui/material/styles'
import type { Decimal } from '@primitives/decimal.utils'
import { MarketAssetsType } from '@primitives/llamalend/markets.constants'
import type { Range } from '@ui/features/queries/util'
import {
  decimalDiv,
  decimalGreaterThan,
  decimalMax,
  decimalMinus,
  decimalMultiply,
  decimalPercent,
  ZERO,
} from '@ui/lib/decimal'

export type PositionStatus = 'liquidatable' | 'inRange' | 'belowRange' | 'nearRange' | 'aboveRange'

export type PositionHealth = {
  /**
   * How far the oracle price is above the liquidation range: oracle price ÷ top of the range, floored at 1.
   * 1.00 means the price has reached the range and soft liquidation can start.
   */
  health: Decimal
  /**
   * Margin left once the price reaches the top of the range, as a % of debt.
   * Inside or below the range it is the margin before hard liquidation.
   * This is the Controller's `health(user, full=false)`.
   */
  liquidationBuffer: Decimal
  /** The liquidation buffer in the borrow token: debt × liquidationBuffer / 100. */
  liquidationBufferAmount: Decimal
  /**
   * Share of the margin from the user's last action still left: buffer ÷ starting buffer
   * starting buffer = (100 − liquidation discount) ÷ (100 − loan discount) − 1 (in %).
   * 1 is fresh, 0 is liquidatable once the price reaches the range.
   * Used for thresholds because the starting buffer differs a lot between markets
   */
  liquidationBufferShare: Decimal
  /**
   * Whether anyone can hard-liquidate the position now.
   * Same check as the Controller's `liquidate()`: full health below 0.
   */
  isLiquidatable: boolean
  status: PositionStatus
}

export type PositionHealthThresholds = {
  /** Above the range, a health at or below this reads as near range */
  nearRangeHealth: number
  /** {@link PositionHealth.liquidationBufferShare} at or below which the position is critical or risky */
  liquidationBufferShare: { critical: number; risky: number }
}

/** Buffer cutoffs shared by the correlated and blue chip markets */
const LIQUIDATION_BUFFER_SHARE_THRESHOLDS = { critical: 0.2, risky: 0.5 } as const

const POSITION_HEALTH_THRESHOLDS = {
  [MarketAssetsType.Correlated]: { nearRangeHealth: 1.01, liquidationBufferShare: LIQUIDATION_BUFFER_SHARE_THRESHOLDS },
  [MarketAssetsType.BlueChip]: { nearRangeHealth: 1.1, liquidationBufferShare: LIQUIDATION_BUFFER_SHARE_THRESHOLDS },
  [MarketAssetsType.LongTail]: { nearRangeHealth: 1.2, liquidationBufferShare: { critical: 0.1, risky: 0.4 } },
} as const satisfies Record<MarketAssetsType, PositionHealthThresholds>

/** Thresholds for the market's assets type. Unmapped markets use the long-tail ones. */
export const getPositionHealthThresholds = (assetsType: MarketAssetsType | undefined): PositionHealthThresholds =>
  POSITION_HEALTH_THRESHOLDS[assetsType ?? MarketAssetsType.LongTail]

// TODO: workaround, remove once the user stats endpoints return price_low and price_high
/**
 * The user's `[low, high]` liquidation range prices, from the market's base price and the user's bands.
 * The price of a band is `basePrice × ((A − 1) / A) ^ band`. The range spans from the top of the first band to the bottom of the last one.
 */
export const getRangePrices = ({
  basePrice,
  A,
  bands: [n1, n2],
}: {
  basePrice: Decimal
  A: number
  bands: Range<number>
}): Range<Decimal> => {
  // One float power of the ratio: powers of A and A − 1 overflow the decimal precision for negative bands
  const bandPrice = (band: number) => decimalMultiply(basePrice, ((A - 1) / A) ** band)
  return [bandPrice(n2 + 1), bandPrice(n1)]
}

/**
 * How far the oracle price must move to reach the liquidation range, in % of the oracle price.
 * Negative above the range (the price must drop), positive below it (the price must rise), 0 inside.
 */
export const getDistanceToRange = (oraclePrice: Decimal, [low, high]: Range<Decimal>): Decimal =>
  decimalPercent(
    decimalMinus(
      decimalGreaterThan(low, oraclePrice) ? low : decimalGreaterThan(oraclePrice, high) ? high : oraclePrice,
      oraclePrice,
    ),
    oraclePrice,
  )

/** Computes {@link PositionHealth.health} from the user's `[low, high]` liquidation range prices. */
export const getHealth = (oraclePrice: Decimal, [, topOfRange]: Range<Decimal>): Decimal =>
  decimalMax(decimalDiv(oraclePrice, topOfRange), '1')!

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
  thresholds: PositionHealthThresholds
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

export const getPositionHealth = ({
  oraclePrice,
  prices,
  liquidationBuffer,
  healthFull,
  debt,
  loanDiscount,
  liquidationDiscount,
  thresholds,
}: {
  oraclePrice: Decimal
  prices: Range<Decimal>
  /** The Controller's `health(user, full=false)`, in % of debt */
  liquidationBuffer: Decimal
  /** The Controller's `health(user, full=true)`, in % of debt */
  healthFull: Decimal
  debt: Decimal
  loanDiscount: Decimal
  liquidationDiscount: Decimal
  thresholds: PositionHealthThresholds
}): PositionHealth => {
  const health = getHealth(oraclePrice, prices)
  // The Controller's `liquidate()` ignores the liquidation buffer: it checks `health(user, full=true) < 0`.
  // Full health also counts the price distance above the range, so a negative buffer alone is not liquidatable.
  const isLiquidatable = decimalGreaterThan(ZERO, healthFull)
  return {
    health,
    liquidationBuffer,
    liquidationBufferAmount: decimalDiv(decimalMultiply(debt, liquidationBuffer), '100'),
    liquidationBufferShare: decimalDiv(
      liquidationBuffer,
      decimalMinus(decimalPercent(decimalMinus('100', liquidationDiscount), decimalMinus('100', loanDiscount)), '100'),
    ),
    isLiquidatable,
    status: getPositionStatus({ health, isLiquidatable, oraclePrice, prices, thresholds }),
  }
}

export const getHealthTextColor = (
  { health, isLiquidatable }: PositionHealth,
  { nearRangeHealth }: PositionHealthThresholds,
  theme: Theme,
) =>
  theme.design.Text.TextColors.Feedback[
    !isLiquidatable && decimalGreaterThan(health, '1') ? (+health <= nearRangeHealth ? 'Warning' : 'Success') : 'Error'
  ]

export const getLiquidationBufferTextColor = (
  { liquidationBufferShare, isLiquidatable }: PositionHealth,
  { liquidationBufferShare: { critical, risky } }: PositionHealthThresholds,
  theme: Theme,
) =>
  theme.design.Text.TextColors.Feedback[
    isLiquidatable || +liquidationBufferShare <= critical
      ? 'Error'
      : +liquidationBufferShare <= risky
        ? 'Warning'
        : 'Success'
  ]
