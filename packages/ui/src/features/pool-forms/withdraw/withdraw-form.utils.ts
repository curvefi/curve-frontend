import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import type { AllowUndefined } from '@ui/features/queries/util'
import {
  decimalDivToPrecision,
  decimalEqual,
  decimalMax,
  decimalMinus,
  decimalMultiply,
  decimalRound,
  decimalSum,
} from '@ui/lib/decimal'
import type { FieldsOf } from '@ui/lib/validation/types'
import type { PoolTokenFields } from '../pool-form.utils'

/** Use the recorded Max selection only when the full LP balance is selected. */
export const getSingleCoinWithdrawIndex = ({
  maxWithdrawIndex,
  lpAmount,
  maxLpAmount,
}: FieldsOf<Pick<WithdrawMutation, 'maxWithdrawIndex' | 'lpAmount' | 'maxLpAmount'>>) =>
  maybes([maxWithdrawIndex, lpAmount, maxLpAmount], (index, amount, balance) =>
    decimalEqual(amount, balance) ? index : undefined,
  )

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
  maxWithdrawIndex: number | undefined
  slippage: Decimal
  supply: Decimal
  seedLock: Decimal
  maximumBurn: Decimal
  expected: Decimal
}

export type WithdrawFormValues = AllowUndefined<
  Omit<WithdrawMutation, 'amounts' | 'maxAmounts' | 'expected'>,
  'decimals' | 'lpAmount' | 'maxLpAmount' | 'supply' | 'seedLock' | 'maximumBurn'
> &
  PoolTokenFields & { decimals: number[] | undefined }
