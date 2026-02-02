import BigNumber from 'bignumber.js'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Query } from '@ui-kit/types/util'
import { mapQuery } from '@ui-kit/types/util'
import type { Decimal } from '@ui-kit/utils'
import { decimal } from '@ui-kit/utils'
import { useUserBalances } from '../user-balances.query'
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
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'depositExpectedVaultShares',
      { depositAmount },
    ] as const,
  queryFn: async ({ marketId, depositAmount }: DepositQuery) =>
    (await requireVault(marketId).vault.previewDeposit(depositAmount)) as Decimal,
  validationSuite: depositValidationSuite,
})

/**
 * Queries the removable vault shares when withdrawing a specific amount.
 */
export const { useQuery: useWithdrawRemovableVaultShares } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, withdrawAmount }: WithdrawParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'withdrawRemovableVaultShares',
      { withdrawAmount },
    ] as const,
  queryFn: async ({ marketId, withdrawAmount }: WithdrawQuery) =>
    (await requireVault(marketId).vault.previewWithdraw(withdrawAmount)) as Decimal,
  validationSuite: withdrawValidationSuite,
})

/**
 * Queries the expected vault shares remaining after withdrawing a specific amount.
 * Calculates: current vault shares - removable vault shares
 */
export function useWithdrawExpectedVaultShares<ChainId extends number>(
  params: WithdrawParams<ChainId>,
  enabled: boolean,
): Query<Decimal> {
  const { chainId, marketId, userAddress } = params
  const userBalances = useUserBalances({ chainId, marketId, userAddress })
  const removableVaultShares = useWithdrawRemovableVaultShares(params, enabled)

  const prevVaultShares = mapQuery(userBalances, (d) => d.vaultShares)

  return mapQuery(
    prevVaultShares,
    (prevVaultShares) =>
      removableVaultShares.data && decimal(new BigNumber(prevVaultShares).minus(removableVaultShares.data)),
  )
}
