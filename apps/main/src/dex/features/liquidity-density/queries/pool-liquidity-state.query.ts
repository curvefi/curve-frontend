import { Contract, isError } from 'ethers'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { poolValidationGroup } from '@evm-ui/queries/validation/pool-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'
import { createValidationSuite } from '@ui/lib/validation/lib'

const curveStateAbi = ['function D() view returns (uint256)', 'function A_precise() view returns (uint256)']

/** Optional getters vary by pool generation. Transport errors must still reach the query. */
const readOptionalParameter = async (contract: Contract, name: 'D' | 'A_precise') => {
  try {
    const value: unknown = await contract.getFunction(name).staticCall()
    if (typeof value !== 'bigint') throw new Error(`Unexpected result from ${name}()`)
    return value.toString()
  } catch (error) {
    if (isError(error, 'CALL_EXCEPTION') || (isError(error, 'BAD_DATA') && error.value === '0x')) return null
    throw error
  }
}

const { useQuery: usePoolLiquidityStateQuery } = queryFactory({
  queryKey: ({ chainId, poolId }: PoolParams) => ({ name: 'pool.liquidityState', chainId, poolId }) as const,
  queryFn: async ({ poolId }: PoolQuery) => {
    const pool = requireLib('curveApi').getPool(poolId)
    const {
      address,
      curve: { provider },
      wrappedCoinAddresses,
      wrappedDecimals,
      isCrypto,
      isMeta,
      isLending,
      isLlamma,
    } = pool
    const contract = new Contract(address, curveStateAbi, provider)
    const [balances, parameters, storedRates, D, APrecise] = await Promise.all([
      pool.stats.wrappedBalances(),
      pool.stats.parameters(),
      isCrypto || isLending ? null : pool.getStoredRates(false),
      isCrypto ? readOptionalParameter(contract, 'D') : null,
      isCrypto ? null : readOptionalParameter(contract, 'A_precise'),
    ])

    // Preserve SDK units: balances/rates are whole units, A is the getter value,
    // gamma/priceScale are divided by 1e18, fee is a percentage. D/APrecise are raw.
    return {
      balances,
      parameters,
      storedRates,
      D,
      APrecise,
      wrappedCoinAddresses,
      wrappedDecimals,
      isCrypto,
      isMeta,
      isLending,
      isLlamma,
    }
  },
  validationSuite: createValidationSuite((params: PoolParams) => {
    poolValidationGroup(params)
    curveApiValidationGroup(params, { requireRpc: true })
  }),
  category: 'dex.pool',
})

export const usePoolLiquidityState = (params: PoolParams, enabled = true) =>
  useHydratedQuery(usePoolLiquidityStateQuery, params, enabled)

export type PoolLiquidityState = QueryData<typeof usePoolLiquidityState>
