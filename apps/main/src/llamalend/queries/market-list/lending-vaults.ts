import { Chain as ChainName } from '@curvefi/prices-api'
import {
  getAllMarkets,
  getAllUserLendingPositions,
  getAllUserMarkets,
  getUserMarketEarnings,
  getUserMarketStats,
  Market,
  type UserMarketStats,
} from '@curvefi/prices-api/llamalend'
import { fromEntries, recordEntries } from '@curvefi/prices-api/objects.util'
import { queryFactory, UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { userAddressValidationSuite } from '@ui-kit/lib/model/query/user-address-validation'
import {
  type UserContractParams,
  type UserContractQuery,
  userContractValidationSuite,
} from '@ui-kit/lib/model/query/user-contract'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { type Address } from '@ui-kit/utils'

export type LendingVault = Market & { chain: ChainName }

export const { getQueryOptions: getLendingVaultsOptions, invalidate: invalidateLendingVaults } = queryFactory({
  queryKey: () => ['lending-vaults', 'v2'] as const,
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

const {
  getQueryOptions: getUserLendingVaultStatsQueryOptions,
  useQuery: useUserLendingVaultStatsQuery,
  invalidate: invalidateUserLendingVaultStats,
} = queryFactory({
  queryKey: ({ userAddress, contractAddress, blockchainId }: UserContractParams) =>
    ['user-lending-vault', 'stats', { blockchainId }, { contractAddress }, { userAddress }, 'v1'] as const,
  queryFn: async ({ userAddress, contractAddress, blockchainId }: UserContractQuery): Promise<UserMarketStats> =>
    getUserMarketStats(userAddress, blockchainId, contractAddress),
  validationSuite: userContractValidationSuite,
})

const {
  useQuery: useUserLendingVaultEarningsQuery,
  getQueryOptions: getUserLendingVaultEarningsQueryOptions,
  invalidate: invalidateUserLendingVaultEarnings,
} = queryFactory({
  queryKey: ({ userAddress, contractAddress, blockchainId }: UserContractParams) =>
    ['user-lending-vault', 'earnings', { blockchainId }, { contractAddress }, { userAddress }, 'v1'] as const,
  queryFn: ({ userAddress, contractAddress, blockchainId }: UserContractQuery) =>
    getUserMarketEarnings(userAddress, blockchainId, contractAddress),
  validationSuite: userContractValidationSuite,
})

export function invalidateAllUserLendingVaults(userAddress: Address | null | undefined) {
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

/**
 * Fetches the user's lending supplies across all chains.
 */
const {
  getQueryOptions: getUserLendingSuppliesQueryOptions,
  getQueryData: getCurrentUserLendingSupplies,
  invalidate: invalidateUserLendingSupplies,
} = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ['user-lending-supplies', { userAddress }, 'v4'] as const,
  queryFn: async ({ userAddress }: UserQuery): Promise<Record<ChainName, Address[]>> => {
    const positions = await getAllUserLendingPositions(userAddress)
    return fromEntries(
      recordEntries(positions).map(([chain, positions]) => [
        chain,
        positions.filter((p) => p.currentShares || p.currentSharesInGauge).map((position) => position.vaultAddress),
      ]),
    )
  },
  validationSuite: userAddressValidationSuite,
})

export function invalidateAllUserLendingSupplies(userAddress: Address | null | undefined) {
  invalidateUserLendingSupplies({ userAddress })
  recordEntries(getCurrentUserLendingSupplies({ userAddress }) ?? {}).forEach(([blockchainId, positions]) =>
    positions.forEach((contractAddress) =>
      invalidateUserLendingVaultEarnings({
        userAddress,
        blockchainId,
        contractAddress,
      }),
    ),
  )
}

export const getUserLendingSuppliesOptions = getUserLendingSuppliesQueryOptions
export const getUserLendingVaultEarningsOptions = getUserLendingVaultEarningsQueryOptions
export const useUserLendingVaultEarnings = useUserLendingVaultEarningsQuery
export const getUserLendingVaultsOptions = getUserLendingVaultsQueryOptions
export const getUserLendingVaultStatsOptions = getUserLendingVaultStatsQueryOptions
export const useUserLendingVaultStats = useUserLendingVaultStatsQuery
