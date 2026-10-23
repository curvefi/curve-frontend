import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import { LP_TOKEN_DECIMALS } from '@ui/features/pool-forms/pool-form.utils'
import { getSingleCoinWithdrawIndex } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { decimalDiv, decimalMultiply, decimalRound, decimalSum } from '@ui/lib/decimal'
import type { WithdrawParams } from './types'

export const getMaximumWithdrawBurn = (
  expected: Decimal,
  { isBalanced, maxWithdrawIndex, lpAmount, maxLpAmount, slippage }: WithdrawParams,
) =>
  isBalanced || getSingleCoinWithdrawIndex({ maxWithdrawIndex, lpAmount, maxLpAmount }) != null
    ? expected
    : decimalRound(
        decimalMultiply(expected, decimalSum('1', decimalDiv(slippage!, '100'))),
        LP_TOKEN_DECIMALS,
        BigNumber.ROUND_HALF_UP, // Match the SDK's toFixed rounding for its maximum burn estimate.
      )
