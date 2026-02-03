import { IChainId } from '@curvefi/api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys, UserMarketQuery } from '@ui-kit/lib/model'
import { FieldsOf } from '@ui-kit/lib/validation/types'
import type { Decimal } from '@ui-kit/utils'
import {
  requireVault,
  SharesToAssetsParams,
  SharesToAssetsQuery,
  userSupplyVaultSharesValidationSuite,
  userSupplyVaultValidationSuite,
} from '../validation/supply.validation'

type UserVaultBalances = {
  collateral: Decimal
  borrowed: Decimal
  vaultShares: Decimal
  gauge: Decimal
}

const convertSharesToAssets = async (market: LendMarketTemplate, shares: Decimal): Promise<Decimal> =>
  (await market.vault.convertToAssets(shares)) as Decimal

/**
 * Queries the user's current vault balances.
 */
const { useQuery: useUserVaultBalances, invalidate: invalidateUserVaultBalances } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: FieldsOf<UserMarketQuery>) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'userVaultBalances'] as const,
  queryFn: async ({ marketId }: UserMarketQuery) =>
    (await requireVault(marketId).wallet.balances()) as UserVaultBalances,
  validationSuite: userSupplyVaultValidationSuite,
})

/**
 * Converts vault shares to underlying asset amount.
 * Example: 100 vault shares -> 0.1 crvUSD
 */
export const { useQuery: useSharesToAssetsAmount, invalidate: invalidateSharesToAssetsAmount } = queryFactory({
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
export const useUserVaultAssetsAmount = (query: FieldsOf<UserMarketQuery>, enabled?: boolean) => {
  const {
    data: userVaultShareBalances,
    isLoading: userVaultShareBalancesLoading,
    error: userVaultShareBalancesError,
  } = useUserVaultBalances(query, enabled)
  const {
    data,
    isLoading: sharesToAssetsLoading,
    error: sharesToAssetsError,
  } = useSharesToAssetsAmount({ ...query, shares: userVaultShareBalances?.vaultShares }, enabled)

  return {
    data,
    isLoading: [userVaultShareBalancesLoading, sharesToAssetsLoading].some(Boolean),
    error: [userVaultShareBalancesError, sharesToAssetsError].find(Boolean),
  }
}
/**
 * Get the user staked vault share balance (gauge) and convert it to underlying asset amounts.
 */
export const useUserStakedVaultAssetsAmount = (query: FieldsOf<UserMarketQuery>, enabled?: boolean) => {
  const {
    data: userVaultShareBalances,
    isLoading: userVaultShareBalancesLoading,
    error: userVaultShareBalancesError,
  } = useUserVaultBalances(query, enabled)
  const {
    data,
    isLoading: sharesToAssetsLoading,
    error: sharesToAssetsError,
  } = useSharesToAssetsAmount({ ...query, shares: userVaultShareBalances?.gauge }, enabled)

  return {
    data,
    isLoading: [userVaultShareBalancesLoading, sharesToAssetsLoading].some(Boolean),
    error: [userVaultShareBalancesError, sharesToAssetsError].find(Boolean),
  }
}

export const invalidateUserVaultAssetAmounts = (params: FieldsOf<UserMarketQuery>) =>
  Promise.all([invalidateUserVaultBalances(params), invalidateSharesToAssetsAmount(params)])
