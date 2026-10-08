import { isNaN } from 'lodash'
import { test } from 'vest'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { fetchTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import { curvePoolValidationGroup } from '@evm-ui/queries/validation/pool-validation'
import { assert } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'
import { getTokens } from '../pool.utils'

type PoolCurrencyReservesQuery = PoolQuery & { isWrapped: boolean; useApi: boolean }
type PoolCurrencyReservesParams = FieldsOf<PoolCurrencyReservesQuery>

const {
  useQuery: usePoolCurrencyReservesQuery,
  fetchQuery: fetchPoolCurrencyReserves,
  invalidate: invalidatePoolCurrencyReservesQuery,
} = queryFactory({
  category: 'dex.pool',
  queryKey: ({ chainId, poolId, isWrapped, useApi }: PoolCurrencyReservesParams) =>
    ({ name: 'stats.currencyReserves', chainId, poolId, isWrapped, useApi }) as const,
  queryFn: async ({ chainId, poolId, isWrapped }: PoolCurrencyReservesQuery) => {
    const pool = requireLib('curveApi').getPool(poolId)
    const { tokens, tokenAddresses } = getTokens(pool, { wrapped: isWrapped })

    const [balances, usdRates] = await Promise.all([
      // Without RPC, leave balances unknown so the query can resolve without reporting an empty pool.
      pool.curve.isNoRPC ? undefined : isWrapped ? pool.stats.wrappedBalances() : pool.stats.underlyingBalances(),
      Promise.all(tokenAddresses.map(tokenAddress => fetchTokenUsdRate({ chainId, tokenAddress }).catch(() => 0))),
    ])

    const isEmpty = !balances?.length || balances.every(b => +b === 0)
    const crTokens = tokenAddresses.map((tokenAddress, idx) => {
      const usdRate = usdRates[idx]
      const balance = assert(decimal(balances?.[idx]), t`Pool token balance is unavailable`)
      const balanceUsd = !isEmpty && +usdRate > 0 && !isNaN(usdRate) ? +balance * usdRate : 0

      return { token: tokens[idx], tokenAddress, balance, balanceUsd, usdRate }
    })
    const total = crTokens.reduce((sum, { balance }) => sum + +balance, 0)
    const totalUsd = crTokens.reduce((sum, { balanceUsd }) => sum + balanceUsd, 0)
    // Only use USD balances if all tokens have a USD balance and the pool isn't empty.
    const useUsdBalances = crTokens.every(cr => cr.balanceUsd)

    return {
      poolId: pool.id,
      tokens: crTokens.map(cr => ({
        ...cr,
        percentShareInPool: isEmpty
          ? '0'
          : ((useUsdBalances ? cr.balanceUsd / totalUsd : +cr.balance / total) * 100).toFixed(2),
      })),
      total: decimal(total),
      totalUsd: decimal(totalUsd),
    }
  },
  validationSuite: createValidationSuite((params: PoolCurrencyReservesParams) => {
    curvePoolValidationGroup(params)
    test('isWrapped', () => {
      enforce(params.isWrapped).isBoolean()
    })
    test('useApi', () => {
      enforce(params.useApi).isBoolean()
    })
  }),
})

export { fetchPoolCurrencyReserves }

/** Invalidate all wrapped and API modes so switching modes cannot reuse reserves from before a transaction. */
export const invalidatePoolCurrencyReserves = (params: PoolParams) =>
  Promise.all(
    [false, true].flatMap(isWrapped =>
      [false, true].map(useApi => invalidatePoolCurrencyReservesQuery({ ...params, isWrapped, useApi })),
    ),
  )

/** Hook to fetch reserves for the selected pool token representation. */
export function usePoolCurrencyReserves(params: Omit<PoolCurrencyReservesParams, 'useApi'>) {
  const { curveApi, isHydrated } = useCurve()
  return usePoolCurrencyReservesQuery(
    { ...params, useApi: !curveApi?.signerAddress },
    isHydrated && curveApi?.isNoRPC === false,
  )
}

export type CurrencyReserves = QueryData<typeof usePoolCurrencyReservesQuery>
