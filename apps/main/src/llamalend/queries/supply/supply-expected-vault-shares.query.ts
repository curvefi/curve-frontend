import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import {
  DepositParams,
  DepositQuery,
  depositValidationSuite,
  requireVault,
  WithdrawParams,
  WithdrawQuery,
  withdrawValidationSuite,
} from '../validation/supply.validation'

/**
 * Queries the expected vault shares after depositing a specific amount.
 */
export const { useQuery: useDepositExpectedVaultShares } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, depositAmount }: DepositParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'previewDeposit', { depositAmount }] as const,
  queryFn: async ({ marketId, depositAmount }: DepositQuery) =>
    (await requireVault(marketId).vault.previewDeposit(depositAmount)) as Decimal,
  category: 'llamalend.supply',
  validationSuite: depositValidationSuite,
})

/**
 * Queries the removable vault shares when withdrawing a specific amount.
 */
export const { useQuery: useWithdrawRemovableVaultShares } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, withdrawAmount }: WithdrawParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'previewWithdraw', { withdrawAmount }] as const,
  queryFn: async ({ marketId, withdrawAmount }: WithdrawQuery) =>
    (await requireVault(marketId).vault.previewWithdraw(withdrawAmount)) as Decimal,
  category: 'llamalend.supply',
  validationSuite: withdrawValidationSuite,
})
