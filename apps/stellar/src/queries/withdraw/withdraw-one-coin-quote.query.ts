import { test } from 'vest'
import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { validatePool } from '@/stellar/queries/validation/pool.validation'
import {
  estimateOneCoinWithdraw,
  type OneCoinWithdrawQuoteQuery,
  validateOneCoinWithdrawQuote,
} from '@ui/features/pool-forms/withdraw/one-coin-withdraw-quote'
import { queryFactory } from '@ui/features/queries/factory'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

type WithdrawOneCoinQuery = PoolQuery & OneCoinWithdrawQuoteQuery
type WithdrawOneCoinParams = FieldsOf<WithdrawOneCoinQuery>

export const { useQuery: useWithdrawOneCoinQuote, invalidate: invalidateWithdrawOneCoinQuote } = queryFactory({
  queryKey: ({ network, pool, amount, maxLpAmount, decimals, index, slippage }: WithdrawOneCoinParams) =>
    ({ name: 'withdrawOneCoinQuote', network, pool, amount, maxLpAmount, decimals, index, slippage }) as const,
  queryFn: ({ network, pool, index, ...params }: WithdrawOneCoinQuery, { signal }) =>
    estimateOneCoinWithdraw({
      ...params,
      signal,
      // Each Stellar read is a separate simulation; candidates in a round run concurrently.
      quote: burns =>
        Promise.all(burns.map(burn => readContract<bigint>(network, pool, 'calc_withdraw_one_coin', [burn, index]))),
    }),
  category: 'dex.deposit',
  validationSuite: createValidationSuite((params: WithdrawOneCoinParams) => {
    validatePool(params)
    validateOneCoinWithdrawQuote(params)
    test('index', 'Invalid pool token index', () => {
      enforce(params.index).isNumber().condition(Number.isInteger).gte(0).lt(8)
    })
  }),
})
