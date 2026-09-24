import { isNaN } from 'lodash'
import { test } from 'vest'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { fetchTokenUsdRate, getTokenUsdRateQueryData } from '@evm-ui/entities/token-usd-rate'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import { type PoolParams, type PoolQuery, rootKeys } from '@evm-ui/lib/model'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { poolValidationGroup } from '@evm-ui/lib/model/query/pool-validation'
import { getErrorMessage } from '@ui/features/errors/errors.util'
import { queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

type PoolCurrencyReservesQuery = PoolQuery & { isWrapped: boolean; useApi: boolean }
type PoolCurrencyReservesParams = FieldsOf<PoolCurrencyReservesQuery>

const poolBalances = async (p: PoolTemplate, isWrapped: boolean) => {
  if (p.curve.isNoRPC) {
    return { error: t`Connect your wallet to see pool balances` }
  }
  try {
    return { balances: isWrapped ? await p.stats.wrappedBalances() : await p.stats.underlyingBalances() }
  } catch (error) {
    console.error(error)
    return { error: getErrorMessage(error, 'error-stats-balances') }
  }
}

const {
  useQuery: usePoolCurrencyReservesQuery,
  fetchQuery: fetchPoolCurrencyReserves,
  invalidate: invalidatePoolCurrencyReservesQuery,
} = queryFactory({
  category: 'dex.pool',
  queryKey: ({ chainId, poolId, isWrapped, useApi }: PoolCurrencyReservesParams) =>
    [...rootKeys.pool({ chainId, poolId }), 'stats.currencyReserves', { isWrapped }, { useApi }] as const,
  queryFn: async ({ chainId, poolId, isWrapped }: PoolCurrencyReservesQuery) => {
    const pool = requireLib('curveApi').getPool(poolId)
    const tokens = isWrapped ? pool.wrappedCoins : pool.underlyingCoins
    const tokenAddresses = isWrapped ? pool.wrappedCoinAddresses : pool.underlyingCoinAddresses

    const [balancesResp] = await Promise.all([
      poolBalances(pool, isWrapped),
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
      total: decimal(total),
      totalUsd: decimal(totalUsd),
    }
  },
  validationSuite: createValidationSuite((params: PoolCurrencyReservesParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
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
  return usePoolCurrencyReservesQuery({ ...params, useApi: !curveApi?.signerAddress }, isHydrated)
}

export type CurrencyReserves = QueryData<typeof usePoolCurrencyReservesQuery>
