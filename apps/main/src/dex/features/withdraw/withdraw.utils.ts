import { BigNumber } from 'bignumber.js'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { Decimal } from '@primitives/decimal.utils'
import { LP_TOKEN_DECIMALS } from '@ui/features/pool-forms/pool-form.utils'
import { decimalDiv, decimalMultiply, decimalRound, decimalSum } from '@ui/lib/decimal'
import type { WithdrawOneCoinQuery, WithdrawParams } from './types'

/** Match curve-js's quote target and arguments for plain pools, lending pools and meta-pool zaps. */
export const getOneCoinWithdrawCalls = (
  pool: PoolTemplate,
  { isWrapped, index }: Pick<WithdrawOneCoinQuery, 'isWrapped' | 'index'>,
  burns: bigint[],
) => {
  const useZap = !isWrapped && (pool.isMetaFactory || (!pool.isCrypto && !!pool.zap) || pool.isMeta)
  const { multicallContract } = pool.curve.contracts[useZap ? pool.zap! : pool.address]
  const calcWithdrawOneCoin = multicallContract.calc_withdraw_one_coin as (
    ...args: (string | bigint | number | boolean)[]
  ) => Parameters<typeof pool.curve.multicallProvider.all>[0][number]
  return burns.map(burn =>
    !isWrapped && pool.isMetaFactory
      ? calcWithdrawOneCoin(pool.address, burn, index)
      : !useZap && pool.id === 'ib'
        ? calcWithdrawOneCoin(burn, index, !isWrapped)
        : calcWithdrawOneCoin(burn, index),
  )
}

/**
 * Balanced and one-coin withdrawals burn a fixed LP amount; slippage applies to their outputs.
 * Imbalance withdrawals add percentage slippage to the expected LP burn, rounding half up to 18 decimals like curve-js.
 * This estimate validates the available LP balance; curve-js requotes when executing the withdrawal.
 */
export const getMaximumWithdrawBurn = (expectedLp: Decimal, { mode, slippage }: WithdrawParams) =>
  mode === 'unbalanced'
    ? decimalRound(
        decimalMultiply(expectedLp, decimalSum('1', decimalDiv(slippage!, '100'))),
        LP_TOKEN_DECIMALS,
        BigNumber.ROUND_HALF_UP,
      )
    : expectedLp
