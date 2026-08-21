import { Chain as ChainName, LEND_CHAINS } from '@curvefi/prices-api'
import {
  getAllMarkets,
  getUserLendingPositions,
  getUserMarkets,
  getUserMarketStats,
  Market,
  USER_MARKETS_DEFAULT_PER_PAGE,
  USER_MARKETS_FIRST_PAGE,
  type UserMarketStats,
} from '@curvefi/prices-api/llamalend'
import { paginate } from '@curvefi/prices-api/paginate'
import type { Address } from '@primitives/address.utils'
import { fromEntries } from '@primitives/objects.utils'
import { type FieldsOf } from '@ui-kit/lib'
import { type ChainNameQuery, queryFactory, type UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/evm-address-validation'
import { pricesApiChainNameValidationGroup } from '@ui-kit/lib/model/query/prices-chain-validation'
import {
  type UserContractParams,
  type UserContractQuery,
  userContractValidationSuite,
} from '@ui-kit/lib/model/query/user-contract'
import { createValidationSuite, EmptyValidationSuite } from '@ui-kit/lib/validation'

type UserChainNameQuery = UserQuery & ChainNameQuery
type UserChainNameParams = FieldsOf<UserChainNameQuery>

const userChainNameValidationSuite = createValidationSuite((params: UserChainNameParams) => {
  userAddressValidationGroup(params)
  pricesApiChainNameValidationGroup(params)
})

export type LendingVault = Market & { chain: ChainName }

export const { getQueryOptions: getLendingVaultsOptions, reset: resetLendingVaults } = queryFactory({
  queryKey: () => ['lending-vaults', 'v4'] as const,
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
  invalidate: invalidateUserLendingVaultsQuery,
  reset: resetUserLendingVaultsQuery,
} = queryFactory({
  queryKey: ({ userAddress, blockchainId }: UserChainNameParams) =>
    ['user-lending-vaults', { blockchainId }, { userAddress }, 'v3'] as const,
  queryFn: async ({ userAddress, blockchainId }: UserChainNameQuery): Promise<Address[]> =>
    (
      await paginate(
        page => getUserMarkets(userAddress, blockchainId, { page }),
        USER_MARKETS_FIRST_PAGE,
        USER_MARKETS_DEFAULT_PER_PAGE,
      )
    ).map(market => market.controller),
  category: 'llamalend.user',
  validationSuite: userChainNameValidationSuite,
})

const {
  getQueryOptions: getUserLendingVaultStatsOptions,
  useQuery: useUserLendingVaultStats,
  invalidate: invalidateUserLendingVaultStats,
  reset: resetUserLendingVaultStats,
} = queryFactory({
  queryKey: ({ userAddress, contractAddress, blockchainId }: UserContractParams) =>
    ['user-lending-vault', 'stats', { blockchainId }, { contractAddress }, { userAddress }, 'v1'] as const,
  queryFn: async ({ userAddress, contractAddress, blockchainId }: UserContractQuery): Promise<UserMarketStats> =>
    getUserMarketStats(userAddress, blockchainId, contractAddress),
  category: 'llamalend.user',
  validationSuite: userContractValidationSuite,
})

export const invalidateAllUserLendingVaults = async (userAddress: Address | null | undefined) => {
  await Promise.all(
    LEND_CHAINS.flatMap(blockchainId => [
      invalidateUserLendingVaultsQuery({ userAddress, blockchainId }),
      ...(getCurrentUserLendingVaults({ userAddress, blockchainId })?.map(contractAddress =>
        invalidateUserLendingVaultStats({ userAddress, blockchainId, contractAddress }),
      ) ?? []),
    ]),
  )
}

export const resetAllUserLendingVaults = async (userAddress: Address | null | undefined) => {
  await Promise.all(
    LEND_CHAINS.flatMap(blockchainId => [
      resetUserLendingVaultsQuery({ userAddress, blockchainId }),
      ...(getCurrentUserLendingVaults({ userAddress, blockchainId })?.map(contractAddress =>
        resetUserLendingVaultStats({ userAddress, blockchainId, contractAddress }),
      ) ?? []),
    ]),
  )
}

export type LendingPosition = {
  supplied: number
  earnings: number
  boostMultiplier: number | null
}

export type UserLendingSupplies = Record<Address, LendingPosition>

/**
 * Fetches the user's lending supplies across all chains.
 */
const {
  getQueryOptions: getUserLendingSuppliesOptions,
  invalidate: invalidateUserLendingSuppliesQuery,
  reset: resetUserLendingSuppliesQuery,
} = queryFactory({
  queryKey: ({ userAddress, blockchainId }: UserChainNameParams) =>
    ['user-lending-supplies', { blockchainId }, { userAddress }, 'v6'] as const,
  category: 'llamalend.user',
  queryFn: async ({ userAddress, blockchainId }: UserChainNameQuery): Promise<UserLendingSupplies> => {
    const positions = await getUserLendingPositions(userAddress, blockchainId)
    return fromEntries(
      positions
        .filter(p => p.totalCurrentAssets > 0)
        .map(({ vaultAddress, totalCurrentAssets, earnings, boostMultiplier }) => [
          vaultAddress,
          { supplied: totalCurrentAssets, earnings, boostMultiplier },
        ]),
    )
  },
  validationSuite: userChainNameValidationSuite,
})

const invalidateUserLendingSupplies = ({ userAddress }: UserParams) =>
  Promise.all(LEND_CHAINS.map(blockchainId => invalidateUserLendingSuppliesQuery({ userAddress, blockchainId })))

const resetUserLendingSupplies = ({ userAddress }: UserParams) =>
  Promise.all(LEND_CHAINS.map(blockchainId => resetUserLendingSuppliesQuery({ userAddress, blockchainId })))

export {
  getUserLendingSuppliesOptions,
  getUserLendingVaultsOptions,
  getUserLendingVaultStatsOptions,
  useUserLendingVaultStats,
  invalidateUserLendingSupplies,
  resetUserLendingSupplies,
}
