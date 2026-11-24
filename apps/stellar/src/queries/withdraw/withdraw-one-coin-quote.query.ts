import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import type { WithdrawOneCoinParams, WithdrawOneCoinQuery } from '@/stellar/features/withdraw/types'
import { withdrawOneCoinQuoteValidationSuite } from '@/stellar/queries/validation/withdraw.validation'
import { estimateOneCoinWithdraw } from '@ui/features/pool-forms/withdraw/one-coin-withdraw-quote'
import { NoRetryError, queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useWithdrawOneCoinQuote, invalidate: invalidateWithdrawOneCoinQuote } = queryFactory({
  queryKey: ({ network, pool, amount, supply, decimals, index, slippage }: WithdrawOneCoinParams) =>
    ({ name: 'withdrawOneCoinQuote', network, pool, amount, supply, decimals, index, slippage }) as const,
  queryFn: ({ network, pool, index, amount, supply, decimals, slippage }: WithdrawOneCoinQuery) =>
    estimateOneCoinWithdraw({
      amount,
      supply,
      decimals: decimals[index],
      slippage,
      quote: burns =>
        Promise.all(
          burns.map(burn =>
            readContract<bigint>(network, pool, 'calc_withdraw_one_coin', [burn, index]).catch(error => {
              if (error instanceof NoRetryError) return null // don't stop just because one burn amount reverted
              throw error
            }),
          ),
        ),
    }),
  category: 'dex.deposit',
  validationSuite: withdrawOneCoinQuoteValidationSuite,
})
