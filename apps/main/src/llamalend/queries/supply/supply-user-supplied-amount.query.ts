import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'
import {
  DepositParams,
  DepositQuery,
  requireVault,
  userSuppliedAmountValidationSuite,
} from '../validation/supply.validation'

/**
 * Queries the user's current supplied amount in the underlying asset.
 * Converts vault shares to the underlying asset amount using vault.convertToAssets.
 */
export const { useQuery: useUserSuppliedAmount, invalidate: invalidateUserSuppliedAmount } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: DepositParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'userSuppliedAmount'] as const,
  queryFn: async ({ marketId }: DepositQuery) => {
    const lendMarket = requireVault(marketId)
    const { vaultShares } = await lendMarket.wallet.balances()
    if (+vaultShares === 0) return '0' as Decimal
    return (await lendMarket.vault.convertToAssets(vaultShares)) as Decimal
  },
  validationSuite: userSuppliedAmountValidationSuite,
})
