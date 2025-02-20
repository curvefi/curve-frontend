import {
  type ChainParams,
  type ChainQuery,
  queryFactory,
  type UserAddressParams,
  type UserAddressQuery,
} from '@ui-kit/lib/model'
import { getUserPools } from '@curvefi/prices-api/pools'
import { userAddressValidationGroup, userAddressValidationSuite } from '@ui-kit/lib/model/query/user-address-validation'
import { type Address, type Chain, CHAIN_ID_NAMES } from '@curvefi/prices-api'
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

export const { fetchQuery: fetchUserPools } = queryFactory({
  queryKey: ({ userAddress, chainId }: UserPoolParams) => ['user', 'pools', { chainId }, { userAddress }] as const,
  queryFn: async ({ userAddress, chainId }: UserPoolQuery): Promise<UserPoolStats[]> => {
    const chains = await fetchSupportedChains({})
    const chain = CHAIN_ID_NAMES[chainId]
    if (chains.includes(chain)) {
      const { positions } = await getUserPools(chain, userAddress)
      return positions.map((pool) => ({ ...pool, chain, userAddress }))
    }

    // for smaller chains, fallback to curvejs (it does too many requests on mainnet)
    const { curve } = useStore.getState()
    if (curve.chainId !== chainId) throw new Error('Invalid chain in curvejs')

    const poolAddresses = await curve.getUserPoolList()
    return poolAddresses.map((poolAddress) => ({ chain, userAddress, poolAddress: poolAddress as Address }))
  },
  staleTime: '1m',
  refetchInterval: '1m',
  validationSuite: createValidationSuite(({ userAddress, chainId }: UserPoolParams) => {
    chainValidationGroup({ chainId })
    userAddressValidationGroup({ userAddress })
  }),
})
