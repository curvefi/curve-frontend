import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { type NetworkParams, type NetworkQuery, type PoolQuery, rootKeys } from '@/stellar/queries/root-keys'
import { validateNetwork } from '@/stellar/queries/validation/pool.validation'
import { assert, range } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'

type PoolData = { coins: StellarContract[]; decimals: number[] }
export type FactoryPool = PoolData & NetworkQuery & { pool: StellarContract; factory: StellarContract }
type FactoryQuery = NetworkQuery & { factory: StellarContract }

const getPoolCount = async ({ network, factory }: FactoryQuery) =>
  await readContract<number>(network, factory, 'pool_count')

const getPoolAddress = async ({ network, factory, index }: NetworkQuery & FactoryQuery & { index: number }) =>
  assert(
    await readContract<StellarContract | undefined>(network, factory, 'pool_list', [index]),
    `Missing pool ${index} in factory ${factory}`,
  )

const getPoolData = async ({ network, factory, pool }: PoolQuery & FactoryQuery) =>
  assert(
    await readContract<PoolData | undefined>(network, factory, 'get_pool_data', [pool]),
    `Missing registry data for pool ${pool}`,
  )

/** Note: temporary factory pools query, it will be replaced by API when available. */
export const { useQuery: useFactoryPools } = queryFactory({
  queryKey: (params: NetworkParams) => [...rootKeys.network(params), 'factories', 'pools'] as const,
  queryFn: async ({ network }: NetworkQuery): Promise<FactoryPool[]> =>
    (
      await Promise.all(
        STELLAR_NETWORKS[network].factories.map(async factory => {
          const count = await getPoolCount({ network, factory })
          return Promise.all(
            range(count).map(async index => {
              const pool = await getPoolAddress({ network, factory, index })
              const { coins, decimals } = await getPoolData({ network, factory, pool })
              return { network, factory, pool, coins, decimals }
            }),
          )
        }),
      )
    ).flat(),
  category: 'dex.pools',
  validationSuite: createValidationSuite(({ network }: NetworkQuery) => validateNetwork(network)),
})
