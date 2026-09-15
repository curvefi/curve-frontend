import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { usePoolRates } from '@/stellar/queries/pool/pool-rates.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { QuoteParams } from '@/stellar/queries/validation/deposit.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { scaleReserves } from '@ui/features/pool-forms/balanced-amounts.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { type Query } from '@ui/features/queries/util'
import { decimalDiv, decimalMinus, decimalMultiply, decimalSum, toWei } from '@ui/lib/decimal'

/** Adjusts the value of the amounts based on the rates and decimals. */
const rateAdjustedValue = (amounts: (Decimal | undefined)[], rates: Decimal[], decimals?: number[]) =>
  decimalSum(
    ...rates.map((rate, index) =>
      maybe(amounts[index], amount => decimalMultiply(decimals ? toWei(amount, decimals[index]) : amount, rate)),
    ),
  )

/** Compare the deposit quote with equal rate-adjusted value deposited in the active reserve proportions. */
export function useDepositPriceImpact(params: QuoteParams, quote: Query<Decimal>) {
  const reserves = usePoolReserves(params)
  const rates = usePoolRates(params)
  const balancedAmounts = combineQueries([reserves, rates], (reserves, rates) =>
    maybes([params.amounts, params.decimals], (amounts, decimals) => {
      if (!decimals.every(precision => precision != null)) return undefined // wait until all decimals are available
      // Raw amounts × stored rates normalize coins with different decimals.
      const value = rateAdjustedValue(amounts, rates, decimals)
      const reserveValue = rateAdjustedValue(reserves, rates)
      if (!+reserveValue) return undefined // Empty seed reserves have no proportions to compare against.
      return scaleReserves(reserves, decimals, value, reserveValue)
    }),
  )
  const balancedQuote = useExpectedLp({ ...params, amounts: balancedAmounts.data, isDeposit: true })
  return combineQueries([quote, balancedQuote, balancedAmounts], (quote, balancedQuote) =>
    +balancedQuote ? decimalMultiply(decimalMinus('1', decimalDiv(quote, balancedQuote)), '100') : undefined,
  )
}
