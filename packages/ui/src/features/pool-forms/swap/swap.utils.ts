import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'

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
