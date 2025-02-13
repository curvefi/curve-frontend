import { queryFactory, UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import {
  getMarkets,
  getUserMarkets,
  getUserMarketStats,
  Market,
  type UserMarketStats,
} from '@curvefi/prices-api/llamalend'
import { getSupportedLendingChains } from '@/loan/entities/chains'
import { Chain } from '@curvefi/prices-api'
import type { Address } from '@ui-kit/utils'
import { userValidationSuite } from '@ui-kit/lib/model/query/user-validation'

export type LendingVault = Market & { chain: Chain }

export const { getQueryOptions: getLendingVaultOptions, invalidate: invalidateLendingVaults } = queryFactory({
  queryKey: () => ['lending-vaults', 'v1'] as const,
  queryFn: async (): Promise<LendingVault[]> => {
    const chains = await getSupportedLendingChains()
    const markets = await Promise.all(
      chains.map(async (chain) => (await getMarkets(chain, {})).map((market) => ({ ...market, chain }))),
    )
    return markets.flat()
  },
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})

export type UserLendingVault = UserMarketStats & { chain: Chain }

export const { getQueryOptions: getUserLendingVaultsOptions, invalidate: invalidateUserLendingVaults } = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ['user-lending-vaults', { userAddress }, 'v1'] as const,
  queryFn: async ({ userAddress }: UserQuery): Promise<Record<Address, UserLendingVault>> => {
    const chains = await getSupportedLendingChains()
    const markets = await Promise.all(
      chains.map(async (chain) => {
        const markets = await getUserMarkets(userAddress, chain, {})
        return Promise.all(
          markets.map(async ({ controller }) => [
            controller,
            { chain, ...(await getUserMarketStats(userAddress, chain, controller)) },
          ]),
        )
      }),
    )
    return Object.fromEntries(markets.flat())
  },
  staleTime: '5m',
  validationSuite: userValidationSuite,
})
