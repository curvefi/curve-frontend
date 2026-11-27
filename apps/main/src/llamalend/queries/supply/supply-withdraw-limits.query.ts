import type { UserMarketParams, UserMarketQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { requireVault, supplyUserValidationSuite } from '../validation/supply.validation'

/** Queries the maximum underlying asset amount the user can withdraw from the vault. */
export const { useQuery: useVaultMaxWithdrawAmount } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) =>
    ({ name: 'maxWithdraw', chainId, marketId, userAddress }) as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    (await requireVault(marketId).vault.maxWithdraw(userAddress)) as Decimal,
  category: 'llamalend.supply',
  validationSuite: supplyUserValidationSuite,
})

/** Queries the maximum vault share amount the user can redeem from the vault. */
export const { useQuery: useVaultMaxRedeemShares } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) =>
    ({ name: 'maxRedeem', chainId, marketId, userAddress }) as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    (await requireVault(marketId).vault.maxRedeem(userAddress)) as Decimal,
  category: 'llamalend.supply',
  validationSuite: supplyUserValidationSuite,
})
