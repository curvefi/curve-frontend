import type { Decimal } from '@primitives/decimal.utils'
import { decimalGreaterThan, decimalIntegerDiv, decimalMultiply, fromWei, toWei } from '@ui/lib/decimal'

/** Scale raw reserves by a ratio, rounding down to each token's precision. */
export const scaleReserves = (reserves: Decimal[], decimals: number[], numerator: Decimal, denominator: Decimal) =>
  reserves.map((reserve, index) =>
    fromWei(decimalIntegerDiv(decimalMultiply(reserve, numerator), denominator), decimals[index]),
  )

/** Preserve the edited amount so that excess precision is still reported by form validation. */
export const getBalancedAmounts = (
  reserves: Decimal[],
  decimals: number[],
  amount: Decimal | undefined,
  index: number,
) => {
  if (amount == null) return reserves.map(() => undefined)
  return scaleReserves(reserves, decimals, toWei(amount, decimals[index]), reserves[index]).map(
    (balanced, tokenIndex) => (tokenIndex === index ? amount : balanced),
  )
}

/** The smallest wallet/reserve ratio limits a balanced deposit; cross-multiply to avoid rounding the ratios. */
export const getLimitingBalanceIndex = (reserves: Decimal[], decimals: number[], balances: Decimal[]) =>
  reserves.reduce(
    (smallest, reserve, index) =>
      decimalGreaterThan(
        decimalMultiply(toWei(balances[smallest], decimals[smallest]), reserve),
        decimalMultiply(toWei(balances[index], decimals[index]), reserves[smallest]),
      )
        ? index
        : smallest,
    0,
  )
