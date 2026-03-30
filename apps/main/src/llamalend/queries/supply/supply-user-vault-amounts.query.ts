import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
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
  category: 'llamalend.supply',
  validationSuite: userSupplyVaultSharesValidationSuite,
})
