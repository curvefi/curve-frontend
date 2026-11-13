import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import { LP_TOKEN_DECIMALS } from '@ui/features/pool-forms/pool-form.utils'
import { decimalDiv, decimalMultiply, decimalRound, decimalSum } from '@ui/lib/decimal'
import type { WithdrawParams } from './types'

/**
 * Balanced and one-coin withdrawals burn a fixed LP amount; slippage applies to their outputs.
 * Imbalance withdrawals add percentage slippage to the expected LP burn, rounding half up to 18 decimals like curve-js.
 * This estimate validates the available LP balance; curve-js requotes when executing the withdrawal.
 */
export const getMaximumWithdrawBurn = (expected: Decimal, { mode, slippage }: WithdrawParams) =>
  mode === 'unbalanced'
    ? decimalRound(
        decimalMultiply(expected, decimalSum('1', decimalDiv(slippage!, '100'))),
        LP_TOKEN_DECIMALS,
        BigNumber.ROUND_HALF_UP,
      )
    : expected
