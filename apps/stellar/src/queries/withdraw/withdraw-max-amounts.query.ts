import { test } from 'vest'
import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { validateAmount } from '@/stellar/queries/validation/liquidity.validation'
import { validatePool, validateTokenDecimals } from '@/stellar/queries/validation/pool.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { fromWei, toWei, ZERO } from '@ui/lib/decimal'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

type WithdrawMaxQuery = PoolQuery & { index: number; decimals: number; lpAmount: Decimal }
type WithdrawMaxParams = FieldsOf<WithdrawMaxQuery>

export const {
  getQueryOptions: getWithdrawMaxAmountQueryOptions,
  fetchQuery: fetchWithdrawMaxAmount,
  invalidate: invalidateWithdrawMaxAmount,
} = queryFactory({
  queryKey: ({ network, pool, index, decimals, lpAmount }: WithdrawMaxParams) =>
    ({ name: 'calc_withdraw_one_coin', network, pool, index, decimals, lpAmount }) as const,
  queryFn: async ({ network, pool, index, decimals, lpAmount }: WithdrawMaxQuery) => {
    const burn = BigInt(toWei(lpAmount, LP_TOKEN_DECIMALS))
    // The contract's one-coin quote requires a positive burn, including in an unseeded pool.
    if (burn === 0n) return ZERO
    return fromWei(await readContract<bigint>(network, pool, 'calc_withdraw_one_coin', [burn, index]), decimals)
  },
  category: 'dex.deposit',
  validationSuite: createValidationSuite(({ network, pool, index, decimals, lpAmount }: WithdrawMaxQuery) => {
    validatePool({ network, pool })
    validateTokenDecimals({ decimals })
    validateAmount('lpAmount', lpAmount, true)
    test('index', 'Invalid pool token index', () => {
      enforce(index).isNumber().condition(Number.isInteger).gte(0).lt(8)
    })
  }),
})
