import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import type { Decimal } from '@primitives/decimal.utils'
import { scaleReserves } from '@ui/features/pool-forms/balanced-amounts.utils'
import { decimalDivToPrecision, decimalGreaterThan, decimalMultiply, decimalRound, decimalSum } from '@ui/lib/decimal'

/** Convert an edited token amount to LP, rounding up so the proportional payout covers it. */
export const getBalancedWithdrawLp = (amount: Decimal, decimals: number, reserve: Decimal, supply: Decimal) => {
  const numerator = decimalMultiply(decimalRound(amount, decimals), supply)
  const lpAmount = decimalDivToPrecision(numerator, reserve, LP_TOKEN_DECIMALS)
  return decimalGreaterThan(numerator, decimalMultiply(lpAmount, reserve))
    ? decimalSum(lpAmount, `1e-${LP_TOKEN_DECIMALS}`)
    : lpAmount
}

export const getBalancedWithdrawAmounts = (
  lpAmount: Decimal,
  reserves: Decimal[],
  supply: Decimal,
  decimals: number[],
) => scaleReserves(reserves, decimals, decimalRound(lpAmount, LP_TOKEN_DECIMALS), supply)
