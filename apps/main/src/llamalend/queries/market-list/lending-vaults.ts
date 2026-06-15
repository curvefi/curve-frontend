import { Chain as ChainName } from '@curvefi/prices-api'
import {
  getAllMarkets,
  getAllUserLendingPositions,
  getAllUserMarkets,
  getUserMarketStats,
  Market,
  type UserMarketStats,
} from '@curvefi/prices-api/llamalend'
import type { Address } from '@primitives/address.utils'
import { fromEntries, recordEntries } from '@primitives/objects.utils'
import { queryFactory, UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { userAddressValidationSuite } from '@ui-kit/lib/model/query/evm-address-validation'
import {
  type UserContractParams,
  type UserContractQuery,
  userContractValidationSuite,
} from '@ui-kit/lib/model/query/user-contract'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'

export type LendingVault = Market & { chain: ChainName }

export const { getQueryOptions: getLendingVaultsOptions, invalidate: invalidateLendingVaults } = queryFactory({
  queryKey: () => ['lending-vaults', 'v3'] as const,
  queryFn: async (): Promise<LendingVault[]> =>
    Object.entries(await getAllMarkets()).flatMap(([chain, markets]) =>
      markets.map(market => ({ ...market, chain: chain as ChainName })),
    ),
  category: 'llamalend.marketList',
  validationSuite: EmptyValidationSuite,
})

const {
  getQueryOptions: getUserLendingVaultsOptions,
  getQueryData: getCurrentUserLendingVaults,
  invalidate: invalidateUserLendingVaults,
} = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ['user-lending-vaults', { userAddress }, 'v2'] as const,
  queryFn: async ({ userAddress }: UserQuery) =>
    Object.fromEntries(
      Object.entries(await getAllUserMarkets(userAddress)).map(([chain, userMarkets]) => [
        chain,
        userMarkets.map(market => market.controller),
      ]),
    ) as Record<ChainName, Address[]>,
  category: 'llamalend.user',
  validationSuite: userAddressValidationSuite,
})

const {
  getQueryOptions: getUserLendingVaultStatsOptions,
  useQuery: useUserLendingVaultStats,
  invalidate: invalidateUserLendingVaultStats,
} = queryFactory({
  queryKey: ({ userAddress, contractAddress, blockchainId }: UserContractParams) =>
    ['user-lending-vault', 'stats', { blockchainId }, { contractAddress }, { userAddress }, 'v1'] as const,
  queryFn: async ({ userAddress, contractAddress, blockchainId }: UserContractQuery): Promise<UserMarketStats> =>
    getUserMarketStats(userAddress, blockchainId, contractAddress),
  category: 'llamalend.user',
  validationSuite: userContractValidationSuite,
})

export async function invalidateAllUserLendingVaults(userAddress: Address | null | undefined) {
  await invalidateUserLendingVaults({ userAddress })

  const invalidateContracts = recordEntries(getCurrentUserLendingVaults({ userAddress }) ?? {}).flatMap(
    ([blockchainId, contracts]) =>
      contracts.map(contractAddress =>
        invalidateUserLendingVaultStats({
          userAddress,
          blockchainId,
          contractAddress,
        }),
      ),
  )
  await Promise.all(invalidateContracts)
}

export type LendingPosition = {
  supplied: number
  earnings: number
  boostMultiplier: number | null
}

/**
 * Fetches the user's lending supplies across all chains.
 */
const { getQueryOptions: getUserLendingSuppliesOptions, invalidate: invalidateUserLendingSupplies } = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ['user-lending-supplies', { userAddress }, 'v5'] as const,
  category: 'llamalend.user',
  queryFn: async ({ userAddress }: UserQuery): Promise<Record<ChainName, Record<Address, LendingPosition>>> => {
    const positions = await getAllUserLendingPositions(userAddress)
    return fromEntries(
      recordEntries(positions).map(([chain, positions]) => [
        chain,
        fromEntries(
          positions
            .filter(p => p.totalCurrentAssets > 0)
            .map(({ vaultAddress, totalCurrentAssets, earnings, boostMultiplier }) => [
              vaultAddress,
              { supplied: totalCurrentAssets, earnings, boostMultiplier },
            ]),
        ),
      ]),
    )
  },
  validationSuite: userAddressValidationSuite,
})

export {
  getUserLendingSuppliesOptions,
  getUserLendingVaultsOptions,
  getUserLendingVaultStatsOptions,
  useUserLendingVaultStats,
  invalidateUserLendingSupplies,
}
