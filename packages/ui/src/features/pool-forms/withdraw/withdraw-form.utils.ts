import type { Decimal } from '@primitives/decimal.utils'
import type { AllowUndefined } from '@ui/features/queries/util'
import {
  decimalDivToPrecision,
  decimalMax,
  decimalMinus,
  decimalMultiply,
  decimalRound,
  decimalSum,
} from '@ui/lib/decimal'
import type { PoolTokenFields } from '../pool-form.utils'

/** Reserve slippage headroom and the smallest LP amount added by execution. */
export const getWithdrawLpBudget = (lpAmount: Decimal, slippage: Decimal, lpTokenDecimals: number): Decimal =>
  decimalMax(
    '0',
    decimalMinus(
      decimalDivToPrecision(
        decimalMultiply(decimalRound(lpAmount, lpTokenDecimals), '100'),
        decimalSum('100', slippage),
        lpTokenDecimals,
      ),
      `1e-${lpTokenDecimals}` as Decimal,
    ),
  )!

export type WithdrawMutation = {
  amounts: (Decimal | undefined)[]
  maxAmounts: (Decimal | undefined)[]
  isBalanced: boolean
  decimals: number[]
  lpAmount: Decimal
  maxLpAmount: Decimal
  slippage: Decimal
  supply: Decimal
  seedLock: Decimal
  maximumBurn: Decimal
  quote: Decimal
}

export type WithdrawFormValues = AllowUndefined<
  Omit<WithdrawMutation, 'amounts' | 'maxAmounts' | 'quote'>,
  'decimals' | 'lpAmount' | 'maxLpAmount' | 'supply' | 'seedLock' | 'maximumBurn'
> &
  PoolTokenFields & { decimals: number[] | undefined }
