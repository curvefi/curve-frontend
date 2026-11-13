import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { LP_TOKEN_DECIMALS } from '@ui/features/pool-forms/pool-form.utils'
import { decimalMinus, decimalMultiply, decimalSum } from '@ui/lib/decimal'

const applyLpSlippage = (amount: Decimal, slippage: Decimal, rounding: BigNumber.RoundingMode): Decimal =>
  new BigNumber(amount)
    .decimalPlaces(LP_TOKEN_DECIMALS, BigNumber.ROUND_DOWN)
    .times(new BigNumber(100).plus(slippage))
    .shiftedBy(-2)
    .decimalPlaces(LP_TOKEN_DECIMALS, rounding)
    .toFixed() as Decimal

/** Apply slippage and floor at LP-token precision, returning a decimal LP amount. */
export const calculateMinimumMint = (expectedLp: Decimal, slippage: Decimal): Decimal =>
  applyLpSlippage(expectedLp, decimalMinus('0', slippage), BigNumber.ROUND_FLOOR)

export const calculateMaximumBurn = (expectedLp: Decimal, slippage: Decimal): Decimal =>
  applyLpSlippage(expectedLp, slippage, BigNumber.ROUND_CEIL)

/** Value of decimal token amounts at their normalized rates. */
export const rateAdjustedValue = (amounts: (Decimal | undefined)[], rates: (Decimal | number)[]) =>
  decimalSum(...rates.map((rate, index) => maybe(amounts[index], amount => decimalMultiply(amount, rate))))
