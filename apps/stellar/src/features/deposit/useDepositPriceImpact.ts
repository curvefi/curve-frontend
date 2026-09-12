import { useExpectedLp } from '@/queries/deposit/deposit-expected-lp.query'
import { usePoolRates } from '@/queries/pool/pool-rates.query'
import { usePoolReserves } from '@/queries/pool/pool-reserves.query'
import type { QuoteParams } from '@/queries/validation/deposit.validation'
import { zip } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { type Query } from '@ui/features/queries/util'
import {
  decimalDiv,
  decimalIntegerDiv,
  decimalMinus,
  decimalMultiply,
  decimalSum,
  fromWei,
  toWei,
} from '@ui/lib/decimal'

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
      // Raw amounts × stored rates normalize coins with different decimals.
      const value = rateAdjustedValue(amounts, rates, decimals)
      const reserveValue = rateAdjustedValue(reserves, rates)
      // Empty seed reserves have no proportions to compare against.
      if (!+reserveValue) return undefined
      return zip(reserves, decimals).map(([reserve, decimals]) =>
        fromWei(decimalIntegerDiv(decimalMultiply(reserve, value), reserveValue), decimals),
      )
    }),
  )
  const balancedQuote = useExpectedLp({ ...params, amounts: balancedAmounts.data })
  return combineQueries([quote, balancedQuote, balancedAmounts], (quote, balancedQuote) =>
    +balancedQuote ? decimalMultiply(decimalMinus('1', decimalDiv(quote, balancedQuote)), '100') : undefined,
  )
}
