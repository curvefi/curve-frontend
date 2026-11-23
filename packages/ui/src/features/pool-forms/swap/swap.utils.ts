import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import type { Query, QueryProp } from '@ui/features/queries/util'
import { decimalEqual } from '@ui/lib/decimal'
import type { SwapFormValues } from './swap-form.utils'

export const LOW_EXCHANGE_RATE = 0.98

export const isLowExchangeRate = (exchangeRate: string | undefined) =>
  !!exchangeRate && +exchangeRate < LOW_EXCHANGE_RATE

/** Rate-bearing tokens don't need to trade 1:1; only check the selected pair's normalized rates. */
export const getLowExchangeRateWarning = (
  lowRate: QueryProp<boolean>,
  storedRates: Query<Decimal[] | null>,
  { fromIndex, toIndex }: Pick<SwapFormValues, 'fromIndex' | 'toIndex'>,
) =>
  lowRate.data
    ? combineQueries(
        [storedRates, lowRate],
        rates => !rates?.some((rate, index) => [fromIndex, toIndex].includes(index) && !decimalEqual(rate, '1')),
      )
    : lowRate

/** Floor the output guarantee to the receiving token's precision. */
export const calculateMinimumReceived = (quote: Decimal, slippage: Decimal, decimals: number): Decimal =>
  new BigNumber(quote)
    .times(new BigNumber(100).minus(slippage))
    .div(100)
    .toFixed(decimals, BigNumber.ROUND_FLOOR) as Decimal

/** Match curve-js's reference trade size, without floating-point powers or fractional raw units. */
export const getSmallSwapAmount = (
  input: Decimal,
  output: Decimal,
  inputDecimals: number,
  outputDecimals: number,
): Decimal => {
  const targetInput = new BigNumber(10).pow(inputDecimals > 5 ? -3 : 0)
  const targetOutput = new BigNumber(10).pow(outputDecimals > 5 ? -3 : 0)
  const reference = BigNumber.max(targetInput, targetOutput.times(input).div(output))
  // For tiny trades use the original quote, yielding zero impact without an unrepresentable reference.
  return BigNumber.min(input, reference, 1).toFixed(inputDecimals, BigNumber.ROUND_CEIL) as Decimal
}
