import {
  type UserContractParams,
  type UserContractQuery,
  userContractValidationSuite,
} from '@/loan/entities/user-contract'
import { Chain as ChainName } from '@curvefi/prices-api'
import { FetchError } from '@curvefi/prices-api/fetch'
import {
  getAllMarkets,
  getAllUserMarkets,
  getUserMarketEarnings,
  getUserMarketStats,
  Market,
  type UserMarketStats,
} from '@curvefi/prices-api/llamalend'
import { queryFactory, UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { userAddressValidationSuite } from '@ui-kit/lib/model/query/user-address-validation'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { type Address } from '@ui-kit/utils'
import { recordEntries } from '@ui-kit/utils/objects.util'

export type LendingVault = Market & { chain: ChainName }

export const {
  getQueryOptions: getLendingVaultsOptions,
  invalidate: invalidateLendingVaults,
  fetchQuery: fetchLendingVaults,
  setQueryData: setLendingVaults,
} = queryFactory({
  queryKey: () => ['lending-vaults', 'v1'] as const,
  queryFn: async (): Promise<LendingVault[]> =>
    Object.entries(await getAllMarkets()).flatMap(([chain, markets]) =>
      markets.map((market) => ({ ...market, chain: chain as ChainName })),
    ),
  validationSuite: EmptyValidationSuite,
})

const {
  getQueryOptions: getUserLendingVaultsQueryOptions,
  getQueryData: getCurrentUserLendingVaults,
  invalidate: invalidateUserLendingVaults,
} = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ['user-lending-vaults', { userAddress }, 'v2'] as const,
  queryFn: async ({ userAddress }: UserQuery) =>
    Object.fromEntries(
      Object.entries(await getAllUserMarkets(userAddress)).map(([chain, userMarkets]) => [
        chain,
        userMarkets.map((market) => market.controller),
      ]),
    ) as Record<ChainName, Address[]>,
  validationSuite: userAddressValidationSuite,
})

const { useQuery: useUserLendingVaultStatsQuery, invalidate: invalidateUserLendingVaultStats } = queryFactory({
  queryKey: ({ userAddress, contractAddress, blockchainId }: UserContractParams) =>
    ['user-lending-vault', 'stats', { blockchainId }, { contractAddress }, { userAddress }, 'v1'] as const,
  queryFn: async ({ userAddress, contractAddress, blockchainId }: UserContractQuery): Promise<UserMarketStats> =>
    getUserMarketStats(userAddress, blockchainId, contractAddress),
  validationSuite: userContractValidationSuite,
})

/**
 * The prices API doesn't have an endpoint yet to retrieve a list of user vaults.
 * Therefore, we currently try to fetch each one of them individually and handle 404 errors gracefully.
 */
async function handle404<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise
  } catch (e) {
    if (e instanceof FetchError && e.status === 404) {
      return null
    }
    throw e
  }
}

export const {
  useQuery: useUserLendingVaultEarnings,
  fetchQuery: fetchUserLendingVaultEarnings,
  invalidate: invalidateUserLendingVaultEarnings,
} = queryFactory({
  queryKey: ({ userAddress, contractAddress, blockchainId }: UserContractParams) =>
    ['user-lending-vault', 'earnings', { blockchainId }, { contractAddress }, { userAddress }, 'v1'] as const,
  queryFn: ({ userAddress, contractAddress, blockchainId }: UserContractQuery) =>
    handle404(getUserMarketEarnings(userAddress, blockchainId, contractAddress)),
  validationSuite: userContractValidationSuite,
})

export function invalidateAllUserLendingVaults(userAddress: Address | undefined) {
  recordEntries(getCurrentUserLendingVaults({ userAddress }) ?? {}).forEach(([blockchainId, contracts]) => {
    invalidateUserLendingVaults({ userAddress })
    contracts.forEach((contractAddress) =>
      invalidateUserLendingVaultStats({
        userAddress,
        blockchainId,
        contractAddress,
      }),
    )
  })
}

export const getUserLendingVaultsOptions = getUserLendingVaultsQueryOptions
export const useUserLendingVaultStats = useUserLendingVaultStatsQuery
