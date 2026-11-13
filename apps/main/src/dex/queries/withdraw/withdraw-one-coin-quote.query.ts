import { test } from 'vest'
import { withdrawMaxValidationSuite } from '@/dex/features/withdraw/withdraw.validation'
import { getPool, tryGetPool } from '@/dex/pool.utils'
import type { PoolQuery } from '@evm-ui/queries/query-types'
import {
  estimateOneCoinWithdraw,
  type OneCoinWithdrawQuoteQuery,
  validateOneCoinWithdrawQuote,
} from '@ui/features/pool-forms/withdraw/one-coin-withdraw-quote'
import { queryFactory } from '@ui/features/queries/factory'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

type WithdrawOneCoinQuery = PoolQuery & OneCoinWithdrawQuoteQuery & { isWrapped: boolean }
type WithdrawOneCoinParams = FieldsOf<WithdrawOneCoinQuery>

export const { useQuery: useWithdrawOneCoinQuote, invalidate: invalidateWithdrawOneCoinQuote } = queryFactory({
  queryKey: ({
    chainId,
    poolAddress,
    isWrapped,
    amount,
    maxLpAmount,
    decimals,
    index,
    slippage,
  }: WithdrawOneCoinParams) =>
    ({
      name: 'withdrawOneCoinQuote',
      chainId,
      poolAddress,
      isWrapped,
      amount,
      maxLpAmount,
      decimals,
      index,
      slippage,
    }) as const,
  queryFn: async ({ poolAddress, isWrapped, index, ...params }: WithdrawOneCoinQuery, { signal }) => {
    const pool = getPool(poolAddress)
    const blockTag = await pool.curve.provider.getBlockNumber()
    // Match curve-js's one-coin quote target and arguments, including lending and meta-pool zaps.
    const useZap = !isWrapped && (pool.isMetaFactory || (!pool.isCrypto && !!pool.zap) || pool.isMeta)
    const { multicallContract } = pool.curve.contracts[useZap ? pool.zap! : pool.address]
    const calcWithdrawOneCoin = multicallContract.calc_withdraw_one_coin as (
      ...args: (string | bigint | number | boolean)[]
    ) => Parameters<typeof pool.curve.multicallProvider.all>[0][number]
    return estimateOneCoinWithdraw({
      ...params,
      signal,
      quote: burns =>
        pool.curve.multicallProvider.all<bigint>(
          burns.map(burn =>
            calcWithdrawOneCoin(
              ...(!isWrapped && pool.isMetaFactory ? [pool.address] : []),
              burn,
              index,
              ...(!useZap && pool.id === 'ib' ? [!isWrapped] : []),
            ),
          ),
          { blockTag },
        ),
    })
  },
  category: 'dex.deposit',
  validationSuite: createValidationSuite((params: WithdrawOneCoinParams) => {
    withdrawMaxValidationSuite.run({ ...params, lpAmount: params.maxLpAmount })
    validateOneCoinWithdrawQuote(params)
    test('isWrapped', 'Wrapped one-coin withdrawal is unavailable', () => {
      const pool = tryGetPool(params.poolAddress)
      enforce(!params.isWrapped || !pool || !(pool.isLending && pool.zap)).isTruthy()
    })
  }),
})
