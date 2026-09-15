import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { scaleReserves } from '@ui/features/pool-forms/balanced-amounts.utils'
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

/** The imbalance quote excludes the one raw LP unit added by execution. */
export const calculateExpectedBurn = (quote: Decimal): Decimal =>
  fromWei(BigInt(toWei(quote, LP_TOKEN_DECIMALS)) + 1n, LP_TOKEN_DECIMALS)

export const calculateMaximumBurn = (expected: Decimal, slippage: Decimal): Decimal =>
  applyLpSlippage(expected, slippage, BigNumber.ROUND_CEIL)

/** Reserve slippage headroom and the execution rounding unit from the entered LP budget. */
export const getWithdrawLpBudget = (lpAmount: Decimal, slippage: Decimal): Decimal =>
  fromWei(
    BigNumber.maximum(
      0,
      new BigNumber(toWei(lpAmount, LP_TOKEN_DECIMALS))
        .times(100)
        .dividedToIntegerBy(new BigNumber(100).plus(slippage))
        .minus(1),
    ).toFixed(),
    LP_TOKEN_DECIMALS,
  )

export const getBalancedWithdrawAmounts = (
  lpAmount: Decimal,
  supply: Decimal,
  reserves: Decimal[],
  decimals: number[],
) => scaleReserves(reserves, decimals, lpAmount, supply)

/** Raw amounts multiplied by stored rates account for different token decimals. */
export const rateAdjustedValue = (amounts: (Decimal | undefined)[], rates: Decimal[], decimals?: number[]) =>
  decimalSum(
    ...rates.map((rate, index) =>
      maybe(amounts[index], amount => decimalMultiply(decimals ? toWei(amount, decimals[index]) : amount, rate)),
    ),
  )
