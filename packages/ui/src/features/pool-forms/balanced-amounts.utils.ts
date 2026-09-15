import { zip } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { decimalGreaterThan, decimalIntegerDiv, decimalMultiply, fromWei, toWei } from '@ui/lib/decimal'

/** Scale raw reserves by a ratio, rounding down to each token's precision. */
export const scaleReserves = (reserves: Decimal[], decimals: number[], numerator: Decimal, denominator: Decimal) =>
  zip(reserves, decimals).map(([reserve, decimals]) => {
    const scaledReserve = decimalMultiply(reserve, numerator)
    return fromWei(decimalIntegerDiv(scaledReserve, denominator), decimals)
  })

/** Preserve the edited amount so that form validation still reports excess precision. */
export const getBalancedAmounts = (
  reserves: Decimal[],
  decimals: number[],
  amount: Decimal | undefined,
  index: number,
) =>
  amount == null
    ? reserves.map(() => undefined)
    : scaleReserves(reserves, decimals, toWei(amount, decimals[index]), reserves[index]).map((balanced, tokenIndex) =>
        tokenIndex === index ? amount : balanced,
      )

/**
 * Fill in pool proportions using the smallest positive wallet-balance/reserve ratio.
 * Compare ratios by cross-multiplying raw amounts to avoid division and rounding.
 * Tokens with no wallet balance remain zero and do not limit the other amounts.
 */
export const getBalancedWalletAmounts = (reserves: Decimal[], decimals: number[], balances: Decimal[]) => {
  const [first, ...rest] = zip(reserves, decimals, balances)
    .map(([reserve, decimals, balance]) => ({ reserve, balance: toWei(balance, decimals) }))
    .filter(({ balance }) => +balance)
  if (!first) return balances.map(() => '0')

  const { balance, reserve } = rest.reduce((limitingToken, currentToken) => {
    const limitingBalanceProduct = decimalMultiply(limitingToken.balance, currentToken.reserve)
    const currentTokenBalanceProduct = decimalMultiply(currentToken.balance, limitingToken.reserve)
    return decimalGreaterThan(limitingBalanceProduct, currentTokenBalanceProduct) ? currentToken : limitingToken
  }, first)

  const amounts = scaleReserves(reserves, decimals, balance, reserve)
  return zip(amounts, balances).map(([amount, balance]) => (+balance ? amount : '0'))
}
