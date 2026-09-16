import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { decimalMinus, decimalMultiply, decimalSum, fromWei, toWei } from '@ui/lib/decimal'

export const MAX_I128 = (1n << 127n) - 1n

export const LP_TOKEN_DECIMALS = 18

const applyLpSlippage = (amount: Decimal, slippage: Decimal, rounding: BigNumber.RoundingMode): Decimal =>
  fromWei(
    new BigNumber(toWei(amount, LP_TOKEN_DECIMALS))
      .times(new BigNumber(100).plus(slippage))
      .shiftedBy(-2)
      .integerValue(rounding)
      .toFixed(),
    LP_TOKEN_DECIMALS,
  )

/** Apply slippage and floor at LP-token precision, returning a decimal LP amount. */
export const calculateMinimumMint = (quote: Decimal, slippage: Decimal): Decimal =>
  applyLpSlippage(quote, decimalMinus('0', slippage), BigNumber.ROUND_FLOOR)

/** Raw amounts multiplied by stored rates account for different token decimals. */
export const rateAdjustedValue = (amounts: (Decimal | undefined)[], rates: Decimal[], decimals?: number[]) =>
  decimalSum(
    ...rates.map((rate, index) =>
      maybe(amounts[index], amount => decimalMultiply(decimals ? toWei(amount, decimals[index]) : amount, rate)),
    ),
  )
