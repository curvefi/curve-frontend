import type { Decimal } from '@primitives/decimal.utils'

export type SortedBandBalance = {
  borrowed: Decimal
  collateral: Decimal
  band: number
}

/**
 * `*Value` fields are denominated in the market borrow token, not USD.
 */
export type FetchedBandsBalances = {
  borrowed: Decimal
  collateral: Decimal
  collateralValue: Decimal
  totalValue: Decimal
  isLiquidationBand: boolean
  n: number
  p_up: Decimal
  p_down: Decimal
  pUpDownMedian: Decimal
}
