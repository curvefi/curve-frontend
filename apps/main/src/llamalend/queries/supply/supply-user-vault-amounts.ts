import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys, UserMarketQuery } from '@ui-kit/lib/model'
import { FieldsOf } from '@ui-kit/lib/validation/types'
import type { Decimal } from '@ui-kit/utils'
import { useUserBalances } from '../user/user-balances.query'
import {
  requireVault,
  SharesToAssetsParams,
  SharesToAssetsQuery,
  userSupplyVaultSharesValidationSuite,
} from '../validation/supply.validation'

const convertSharesToAssets = async (market: LendMarketTemplate, shares: Decimal): Promise<Decimal> =>
  (await market.vault.convertToAssets(shares)) as Decimal

/**
 * Converts vault shares to underlying asset amount.
 * Example: 100 vault shares -> 0.1 crvUSD
 */
export const { useQuery: useSharesToAssetsAmount } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, shares }: SharesToAssetsParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'sharesToAssets', { shares }] as const,
  queryFn: async ({ marketId, shares }: SharesToAssetsQuery) => {
    const lendMarket = requireVault(marketId)
    return await convertSharesToAssets(lendMarket, shares)
  },
  validationSuite: userSupplyVaultSharesValidationSuite,
})

/**
 * Get the user vault share balance and convert it to underlying asset amounts.
 */
export const useUserVaultSharesToAssetsAmount = (query: FieldsOf<UserMarketQuery>, enabled?: boolean) => {
  const {
    data: userVaultShareBalances,
    isLoading: userVaultShareBalancesLoading,
    error: userVaultShareBalancesError,
  } = useUserBalances(query, enabled)
  const {
    data,
    isLoading: sharesToAssetsLoading,
    error: sharesToAssetsError,
  } = useSharesToAssetsAmount({ ...query, shares: userVaultShareBalances?.vaultShares }, enabled)

  return {
    data,
    isLoading: [userVaultShareBalancesLoading, sharesToAssetsLoading].some(Boolean),
    error: [userVaultShareBalancesError, sharesToAssetsError].find(Boolean) ?? null,
  }
}

/**
 * Get the user staked vault share balance (gauge) and convert it to underlying asset amounts.
 */
export const useUserStakedVaultSharesToAssetsAmount = (query: FieldsOf<UserMarketQuery>, enabled?: boolean) => {
  const {
    data: userVaultShareBalances,
    isLoading: userVaultShareBalancesLoading,
    error: userVaultShareBalancesError,
  } = useUserBalances(query, enabled)
  const {
    data,
    isLoading: sharesToAssetsLoading,
    error: sharesToAssetsError,
  } = useSharesToAssetsAmount({ ...query, shares: userVaultShareBalances?.gauge }, enabled)

  return {
    data,
    isLoading: [userVaultShareBalancesLoading, sharesToAssetsLoading].some(Boolean),
    error: [userVaultShareBalancesError, sharesToAssetsError].find(Boolean) ?? null,
  }
}
