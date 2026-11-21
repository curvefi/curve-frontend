import type { WithdrawOneCoinParams, WithdrawOneCoinQuery } from '@/dex/features/withdraw/types'
import { getOneCoinWithdrawCalls } from '@/dex/features/withdraw/withdraw.utils'
import { withdrawOneCoinQuoteValidationSuite } from '@/dex/features/withdraw/withdraw.validation'
import { getPool } from '@/dex/pool.utils'
import { estimateOneCoinWithdraw } from '@ui/features/pool-forms/withdraw/one-coin-withdraw-quote'
import { queryFactory } from '@ui/features/queries/factory'

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
  queryFn: async ({ poolAddress, isWrapped, index, amount, maxLpAmount, decimals, slippage }: WithdrawOneCoinQuery) => {
    const pool = getPool(poolAddress)
    // Pin all search rounds to one block so cached quote bounds remain comparable.
    const blockTag = await pool.curve.provider.getBlockNumber()
    return estimateOneCoinWithdraw({
      amount,
      maxLpAmount,
      decimals: decimals[index],
      slippage,
      quote: burns =>
        pool.curve.multicallProvider.tryAll<bigint>(getOneCoinWithdrawCalls(pool, { isWrapped, index }, burns), {
          blockTag,
        }),
    })
  },
  category: 'dex.pool',
  validationSuite: withdrawOneCoinQuoteValidationSuite,
})
