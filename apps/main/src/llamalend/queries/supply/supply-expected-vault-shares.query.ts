import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'
import { DepositParams, DepositQuery, depositValidationSuite, requireVault } from '../validation/supply.validation'

/**
 * Queries the expected vault shares after depositing a specific amount.
 */
export const { useQuery: useDepositExpectedVaultShares, fetchQuery: fetchDepositExpectedVaultShares } = queryFactory({
  queryKey: ({ chainId, marketId, depositAmount }: DepositParams) =>
    [...rootKeys.market({ chainId, marketId }), 'depositExpectedVaultShares', { depositAmount }] as const,
  queryFn: async ({ marketId, depositAmount }: DepositQuery) =>
    (await requireVault(marketId).vault.previewDeposit(depositAmount)) as Decimal,
  validationSuite: depositValidationSuite,
})
