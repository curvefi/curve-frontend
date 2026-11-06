import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui/features/queries/util'
import { decimalDiv, decimalMax } from '@ui/lib/decimal'

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
}

/** Computes {@link PositionHealth.health} from the user's `[low, high]` liquidation range prices. */
export const getHealth = (oraclePrice: Decimal, [, topOfRange]: Range<Decimal>): Decimal =>
  decimalMax(decimalDiv(oraclePrice, topOfRange), '1')!
