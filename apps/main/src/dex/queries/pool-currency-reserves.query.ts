import { isNaN } from 'lodash'
import { test } from 'vest'
import { curvejsApi } from '@/dex/lib/curvejs'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import type { QueryData } from '@evm-ui/lib'
import { type PoolParams, type PoolQuery, rootKeys } from '@evm-ui/lib/model'
import { fetchTokenUsdRate, getTokenUsdRateQueryData } from '@evm-ui/lib/model/entities/token-usd-rate'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { poolValidationGroup } from '@evm-ui/lib/model/query/pool-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

type PoolCurrencyReservesQuery = PoolQuery & { isWrapped: boolean }
type PoolCurrencyReservesParams = FieldsOf<PoolCurrencyReservesQuery>

const {
  useQuery: usePoolCurrencyReservesQuery,
  fetchQuery: fetchPoolCurrencyReserves,
  invalidate: invalidatePoolCurrencyReservesQuery,
} = queryFactory({
  category: 'dex.pool',
  queryKey: ({ chainId, poolId, isWrapped }: PoolCurrencyReservesParams) =>
    [...rootKeys.pool({ chainId, poolId }), 'stats.currencyReserves', { isWrapped }] as const,
  queryFn: async ({ chainId, poolId, isWrapped }: PoolCurrencyReservesQuery) => {
    const pool = requireLib('curveApi').getPool(poolId)
    const tokens = curvejsApi.pool.poolTokens(pool, isWrapped)
    const tokenAddresses = curvejsApi.pool.poolTokenAddresses(pool, isWrapped)

    const [balancesResp] = await Promise.all([
      curvejsApi.pool.poolBalances(pool, isWrapped),
      // Fetching the token prices now, used later with getTokenUsdRateQueryData.
      ...tokenAddresses.map(tokenAddress => fetchTokenUsdRate({ chainId, tokenAddress }).catch(() => 0)),
    ])

    const { balances } = balancesResp
    const isEmpty = !balances?.length || balances.every(b => +b === 0)
    const crTokens = tokenAddresses.map((tokenAddress, idx) => {
      const usdRate = getTokenUsdRateQueryData({ chainId, tokenAddress }) ?? 0
      const balance = Number(balances?.[idx])
      const balanceUsd = !isEmpty && +usdRate > 0 && !isNaN(usdRate) ? balance * usdRate : 0

      return { token: tokens[idx], tokenAddress, balance, balanceUsd, usdRate }
    })
    const total = crTokens.reduce((sum, { balance }) => sum + balance, 0)
    const totalUsd = crTokens.reduce((sum, { balanceUsd }) => sum + balanceUsd, 0)
    // Only use USD balances if all tokens have a USD balance and the pool isn't empty.
    const useUsdBalances = crTokens.every(cr => cr.balanceUsd)

    return {
      poolId: pool.id,
      tokens: crTokens.map(cr => ({
        ...cr,
        percentShareInPool: isEmpty
          ? '0'
          : ((useUsdBalances ? cr.balanceUsd / totalUsd : cr.balance / total) * 100).toFixed(2),
      })),
      total: total.toString(),
      totalUsd: totalUsd.toString(),
    }
  },
  validationSuite: createValidationSuite((params: PoolCurrencyReservesParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
    test('isWrapped', () => {
      enforce(params.isWrapped).isBoolean()
    })
  }),
})

export { fetchPoolCurrencyReserves }

/** Invalidate both representations so switching wrapped mode cannot reuse reserves from before a transaction. */
export const invalidatePoolCurrencyReserves = (params: PoolParams) =>
  Promise.all([false, true].map(isWrapped => invalidatePoolCurrencyReservesQuery({ ...params, isWrapped })))

/** Hook to fetch reserves for the selected pool token representation. */
export function usePoolCurrencyReserves(params: PoolCurrencyReservesParams) {
  const { isHydrated } = useCurve()
  return usePoolCurrencyReservesQuery(params, isHydrated)
}

export type CurrencyReserves = QueryData<typeof usePoolCurrencyReservesQuery>
