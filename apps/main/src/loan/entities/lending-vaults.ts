import { enforce, group, test } from 'vest'
import { fetchMarketNames } from '@/lend/entities/chain/chain-query'
import { ChainId } from '@/lend/types/lend.types'
import {
  type UserContractParams,
  type UserContractQuery,
  userContractValidationSuite,
} from '@/loan/entities/user-contract'
import type { LlamaApi } from '@/loan/types/loan.types'
import { Chain as ChainName } from '@curvefi/prices-api'
import {
  getAllMarkets,
  getAllUserMarkets,
  getUserMarketEarnings,
  getUserMarketStats,
  Market,
  type UserMarketEarnings,
  type UserMarketStats,
} from '@curvefi/prices-api/llamalend'
import { getLib, requireLib } from '@ui-kit/features/connect-wallet'
import { type ChainParams, type ChainQuery, queryFactory, UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { apiValidationGroup, chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { userAddressValidationGroup, userAddressValidationSuite } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite, EmptyValidationSuite } from '@ui-kit/lib/validation'
import { type Address } from '@ui-kit/utils'

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

const {
  getQueryOptions: getUserLendingSuppliesQueryOptions,
  getQueryData: getCurrentUserLendingSupplies,
  invalidate: invalidateUserLendingSupplies,
} = queryFactory({
  queryKey: ({ chainId, userAddress }: UserParams & ChainParams<ChainId>) =>
    ['user-lending-supplies', { chainId }, { userAddress }, 'v2'] as const,
  queryFn: async ({ chainId, userAddress }: UserQuery & ChainQuery<ChainId>) => {
    const api = requireLib<LlamaApi>()
    if (api.signerAddress !== userAddress) throw new Error('User address does not match API signer address')
    const names = await fetchMarketNames({ chainId })
    return {
      // todo: multi-chain not supported
      [chainId]: Object.fromEntries(
        await Promise.all(
          names.map(async (name) => {
            const market = api.getLendMarket(name)
            const { vaultShares } = await market.wallet.balances()
            return [market.addresses.controller, +vaultShares && +(await market.vault.convertToAssets(vaultShares))]
          }),
        ),
      ),
    } as Record<ChainName, Address[]>
  },
  validationSuite: createValidationSuite(({ chainId, userAddress }: UserParams & ChainParams<ChainId>) => {
    userAddressValidationGroup({ userAddress })
    chainValidationGroup({ chainId })
    apiValidationGroup({ chainId })
    group('userAddressLibCheck', () => {
      test('userAddress', 'Invalid EVM address', () => {
        const lib = getLib<LlamaApi>()
        if (userAddress && lib) {
          enforce(userAddress).equals(lib.signerAddress)
        }
      })
    })
  }),
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
    const blockchainId = chain as ChainName
    contracts.forEach((contractAddress) => {
      invalidateUserLendingVaultStats({ userAddress, blockchainId, contractAddress })
    })
  })
}

export function invalidateAllUserLendingSupplies(userAddress: Address | undefined) {
  Object.entries(getCurrentUserLendingSupplies({ userAddress }) ?? {}).forEach(([chain, contracts]) => {
    invalidateUserLendingSupplies({ userAddress })
    const blockchainId = chain as ChainName
    contracts.forEach((contractAddress) => {
      invalidateUserLendingVaultEarnings({ userAddress, blockchainId, contractAddress })
    })
  })
}

export const getUserLendingVaultsOptions = getUserLendingVaultsQueryOptions
export const getUserLendingSuppliesOptions = getUserLendingSuppliesQueryOptions
export const useUserLendingVaultStats = useUserLendingVaultStatsQuery
export const useUserLendingVaultEarnings = useUserLendingVaultEarningsQuery
