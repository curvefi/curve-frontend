import {
  type ChainParams,
  type ChainQuery,
  queryFactory,
  type UserAddressParams,
  type UserAddressQuery,
} from '@ui-kit/lib/model'
import { getUserPools } from '@curvefi/prices-api/pools'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { type Address, type Chain } from '@curvefi/prices-api'
import { fetchSupportedChains } from '@ui-kit/entities/chains'
import { createValidationSuite } from '@ui-kit/lib'
import useStore from '@/dex/store/useStore'
import type { ChainId } from '@/dex/types/main.types'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'

export type UserPoolStats = {
  chain: Chain
  userAddress: Address
  poolId?: string
  poolAddress: Address
  poolName?: string
  lpTokenBalance?: number
}

type UserPoolParams = UserAddressParams & ChainParams<ChainId>
type UserPoolQuery = UserAddressQuery & ChainQuery<ChainId>

/** Create a function to get pool IDs from pool addresses */
function createGetPoolIds(chainId: number) {
  const {
    pools: { poolsMapper },
  } = useStore.getState()
  const poolIds = Object.fromEntries(
    Object.entries(poolsMapper[chainId]).map(([poolId, { pool }]) => [pool.address, poolId]),
  )
  return (poolAddress: string) => {
    const poolId = poolIds[poolAddress.toLowerCase()]
    if (!poolId) {
      console.warn(`Pool ID not found for address ${poolAddress}`)
    }
    return poolId
  }
}

function getChainName(chainId: ChainId): Chain {
  const {
    networks: { networks },
  } = useStore.getState()
  const network = networks[chainId]
  return network.id as Chain
}

const queryUserPools = async ({ userAddress, chainId }: UserPoolQuery): Promise<UserPoolStats[]> => {
  const { curve } = useStore.getState()
  const chains = await fetchSupportedChains({})
  const getPoolId = createGetPoolIds(chainId)

  // use API when supported
  const chain = getChainName(chainId)
  if (chains.includes(chain)) {
    const { positions } = await getUserPools(chain, userAddress)
    return positions.map((pool) => ({ ...pool, chain, userAddress, poolId: getPoolId(pool.poolAddress) }))
  }

  // for smaller chains, fallback to curve-js (it does too many requests on mainnet)
  if (curve.chainId !== chainId) throw new Error('Invalid chain in curvejs')
  console.warn(`chain ${chain} (${chainId}) not supported by API, using curvejs for user pools`)
  const poolAddresses = await curve.getUserPoolList()
  return poolAddresses.map((poolAddress) => ({
    chain,
    userAddress,
    poolAddress: poolAddress as Address,
    poolId: getPoolId(poolAddress),
  }))
}

export const { fetchQuery: fetchUserPools } = queryFactory({
  queryKey: ({ userAddress, chainId }: UserPoolParams) => ['userPools', { chainId }, { userAddress }] as const,
  queryFn: queryUserPools,
  staleTime: '1m',
  refetchInterval: '1m',
  validationSuite: createValidationSuite(({ userAddress, chainId }: UserPoolParams) => {
    chainValidationGroup({ chainId })
    userAddressValidationGroup({ userAddress })
  }),
})
