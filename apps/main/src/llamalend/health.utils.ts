import type { Theme } from '@mui/material/styles'
import type { Decimal } from '@primitives/decimal.utils'
import { MarketAssetsType } from '@primitives/llamalend/markets.constants'
import type { Range } from '@ui/features/queries/util'
import { decimalDiv, decimalGreaterThan, decimalMax } from '@ui/lib/decimal'

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
