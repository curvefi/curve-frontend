import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import type { UserMarketParams, UserMarketQuery } from '@evm-ui/lib/model/query/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { requireVault, supplyUserValidationSuite } from '../validation/supply.validation'

/** Queries the maximum underlying asset amount the user can withdraw from the vault. */
export const { useQuery: useVaultMaxWithdrawAmount } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'maxWithdraw'] as const,
  queryFn: async ({ marketId }: UserMarketQuery) => (await requireVault(marketId).vault.maxWithdraw()) as Decimal,
  category: 'llamalend.supply',
  validationSuite: supplyUserValidationSuite,
})

/** Queries the maximum vault share amount the user can redeem from the vault. */
export const { useQuery: useVaultMaxRedeemShares } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'maxRedeem'] as const,
  queryFn: async ({ marketId }: UserMarketQuery) => (await requireVault(marketId).vault.maxRedeem()) as Decimal,
  category: 'llamalend.supply',
  validationSuite: supplyUserValidationSuite,
})
