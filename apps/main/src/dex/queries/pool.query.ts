import { getAddress } from 'viem'
import { tryGetPool } from '@/dex/pool.utils'
import { fetchPoolPricesApi } from '@/dex/queries/pool-prices-api.query'
import type { IExternalPoolData, IFactoryPoolType } from '@curvefi/api/lib/interfaces'
import type { PoolType, V2PoolDetails } from '@curvefi/prices-api/pools'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { CurveApi } from '@evm-ui/features/connect-wallet/lib/types'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { FetchError } from '@primitives/fetch.utils'
import { queryClient } from '@ui/features/queries/query-client'

const NAME = 'pool'

const factoryPoolTypes: Partial<Record<PoolType, IFactoryPoolType>> = {
  factory: 'factory',
  factory_crypto: 'factory-crypto',
  crvusd: 'factory-crvusd',
  factory_tricrypto: 'factory-tricrypto',
  stableswapng: 'factory-stable-ng',
  twocryptong: 'factory-twocrypto',
}

const REQUIRES_IMPLEMENTATION: IFactoryPoolType[] = ['factory', 'factory-crvusd', 'factory-tricrypto']

const toPoolData = (pool: V2PoolDetails): IExternalPoolData => {
  const registryType = pool.registryType ?? pool.poolType
  const poolType = registryType && factoryPoolTypes[registryType]
  if (!poolType) throw new Error(`Unsupported registry type ${registryType} for pool ${pool.address}`)

  const implementationAddress = pool.info.implementationAddress ?? undefined
  if (REQUIRES_IMPLEMENTATION.includes(poolType) && !implementationAddress)
    throw new Error(`Missing implementation address for pool ${pool.address}`)

  return {
    poolType,
    address: pool.address,
    name: pool.name,
    lpTokenAddress: pool.lpTokenAddress,
    gaugeAddress: pool.gauges[0],
    implementationAddress,
    isMetaPool: pool.isMetapool ?? pool.metapool ?? false,
    basePoolAddress: pool.basePool ?? undefined,
    coins: pool.coins
      .toSorted((a, b) => a.poolIndex - b.poolIndex)
      .map(({ address, symbol, decimals }) => {
        if (decimals == null) throw new Error(`Missing decimals for coin ${address} in pool ${pool.address}`)
        return { address, symbol, decimals }
      }),
  }
}

/** Loading a pool requires recursively loading up required base pools (tree traversal). */
async function loadPool({ chainId, poolAddress }: PoolQuery, curveApi: CurveApi, visiting = new Set<string>()) {
  const pool = tryGetPool(poolAddress, curveApi)
  if (pool) return pool
  if (isLiteChain(chainId)) return null

  if (visiting.has(poolAddress)) throw new Error(`Circular base pool dependency for pool ${poolAddress}`)
  visiting.add(poolAddress)

  const data = toPoolData(await fetchPoolPricesApi({ chainId, poolAddress }))

  // Sequential because parallel tree traversal bookkeeping becomes more complex, and `getRequiredBasePools` returns either 0 or 1 pools at most.
  for (const baseAddress of curveApi.getRequiredBasePools(data)) {
    try {
      await loadPool({ chainId, poolAddress: getAddress(baseAddress) }, curveApi, visiting)
    } catch (error) {
      // A missing base does not mean the requested pool is missing.
      throw new Error(`Unable to load base pool ${baseAddress} for pool ${poolAddress}`, { cause: error })
    }
  }
  visiting.delete(poolAddress)

  return curveApi.getPoolByData(data)
}

export const { useQuery: usePool } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: NAME, chainId, poolAddress }) as const,
  queryFn: async (params: PoolQuery) => {
    try {
      return await loadPool(params, requireLib('curveApi'))
    } catch (error) {
      if (error instanceof FetchError && error.status === 404) return null
      throw error
    }
  },
  validationSuite: curvePoolValidationSuite,
  category: 'global.no-persist',
  disableLog: true, // PoolTemplate has circular references that the Cypress query logger cannot serialize.
})

/** Discard all pool instances bound to the previous Curve instance, including in-flight lookups. */
export const resetPoolQueries = () => queryClient.resetQueries({ queryKey: [{ name: NAME }] })
