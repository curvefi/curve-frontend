import { fetchSupportedLendingChains } from '@/loan/entities/chains'
import {
  type UserContractParams,
  type UserContractQuery,
  userContractValidationSuite,
} from '@/loan/entities/user-contract'
import { Chain } from '@curvefi/prices-api'
import {
  getMarkets,
  getUserMarketEarnings,
  getUserMarkets,
  getUserMarketStats,
  Market,
  type UserMarketEarnings,
  type UserMarketStats,
} from '@curvefi/prices-api/llamalend'
import { queryFactory, UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { userValidationSuite } from '@ui-kit/lib/model/query/user-validation'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import type { Address } from '@ui-kit/utils'

export type LendingVault = Market & { chain: Chain }

export const {
  getQueryOptions: getLendingVaultsOptions,
  invalidate: invalidateLendingVaults,
  fetchQuery: fetchLendingVaults,
  setQueryData: setLendingVaults,
} = queryFactory({
  queryKey: () => ['lending-vaults', 'v1'] as const,
  queryFn: async (): Promise<LendingVault[]> => {
    const chains = await fetchSupportedLendingChains({})
    const markets = await Promise.all(
      chains.map(async (chain) => (await getMarkets(chain)).map((market) => ({ ...market, chain }))),
    )
    return markets.flat()
  },
  validationSuite: EmptyValidationSuite,
})

const {
  getQueryOptions: getUserLendingVaultsQueryOptions,
  getQueryData: getCurrentUserLendingVaults,
  invalidate: invalidateUserLendingVaults,
} = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ['user-lending-vaults', { userAddress }, 'v2'] as const,
  queryFn: async ({ userAddress }: UserQuery) => {
    const chains = await fetchSupportedLendingChains({})
    const markets = await Promise.all(
      chains.map(async (chain) => {
        const markets = await getUserMarkets(userAddress, chain, {})
        return [chain, markets.map((m) => m.controller)] as const
      }),
    )
    return Object.fromEntries(markets) as Record<Chain, Address[]>
  },
  validationSuite: userValidationSuite,
})

const { useQuery: useUserLendingVaultStatsQuery, invalidate: invalidateUserLendingVaultStats } = queryFactory({
  queryKey: ({ userAddress, contractAddress, blockchainId }: UserContractParams) =>
    ['user-lending-vault', 'stats', { blockchainId }, { contractAddress }, { userAddress }, 'v1'] as const,
  queryFn: async ({ userAddress, contractAddress, blockchainId }: UserContractQuery): Promise<UserMarketStats> =>
    getUserMarketStats(userAddress, blockchainId, contractAddress),
  validationSuite: userContractValidationSuite,
})

const { useQuery: useUserLendingVaultEarningsQuery, invalidate: invalidateUserLendingVaultEarnings } = queryFactory({
  queryKey: ({ userAddress, contractAddress, blockchainId }: UserContractParams) =>
    ['user-lending-vault', 'earnings', { blockchainId }, { contractAddress }, { userAddress }, 'v1'] as const,
  queryFn: async ({ userAddress, contractAddress, blockchainId }: UserContractQuery): Promise<UserMarketEarnings> =>
    getUserMarketEarnings(userAddress, blockchainId, contractAddress),
  validationSuite: userContractValidationSuite,
})

export function invalidateAllUserLendingVaults(userAddress: Address | undefined) {
  Object.entries(getCurrentUserLendingVaults({ userAddress }) ?? {}).forEach(([chain, contracts]) => {
    invalidateUserLendingVaults({ userAddress })
    const blockchainId = chain as Chain
    contracts.forEach((contractAddress) => {
      invalidateUserLendingVaultStats({ userAddress, blockchainId, contractAddress })
      invalidateUserLendingVaultEarnings({ userAddress, blockchainId, contractAddress })
    })
  })
}

export const getUserLendingVaultsOptions = getUserLendingVaultsQueryOptions
export const useUserLendingVaultStats = useUserLendingVaultStatsQuery
export const useUserLendingVaultEarnings = useUserLendingVaultEarningsQuery
