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
import { chainValidationGroup } from '@/lend/entities/chain'

export type UserPoolStats = {
  chain: Chain
  userAddress: Address
  poolAddress: Address
  poolName?: string
  lpTokenBalance?: number
}

type UserPoolParams = UserAddressParams & ChainParams
type UserPoolQuery = UserAddressQuery & ChainQuery

const queryUserPools = async ({ userAddress, chainId }: UserPoolQuery): Promise<UserPoolStats[]> => {
  const {
    curve,
    networks: { networks },
  } = useStore.getState()
  const chains = await fetchSupportedChains({})

  // use API when supported
  const chain = networks[chainId].name.toLowerCase() as Chain
  if (chains.includes(chain)) {
    const { positions } = await getUserPools(chain, userAddress)
    return positions.map((pool) => ({ ...pool, chain, userAddress }))
  }

  // for smaller chains, fallback to curvejs (it does too many requests on mainnet)
  if (curve.chainId !== chainId) throw new Error('Invalid chain in curvejs')
  console.warn(`chain ${chain} (${chainId}) not supported by API, using curvejs for user pools`)
  const poolAddresses = await curve.getUserPoolList()
  return poolAddresses.map((poolAddress) => ({ chain, userAddress, poolAddress: poolAddress as Address }))
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
