import { createEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { queryFactory } from '@ui/features/queries/factory'
import { requireVault, WithdrawParams, WithdrawQuery, withdrawValidationSuite } from '../validation/supply.validation'

const { useQuery: useWithdrawEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, withdrawAmount, isFull, userVaultShares }: WithdrawParams) => ({
    name: 'estimateGas.withdraw',
    chainId,
    marketId,
    userAddress,
    withdrawAmount,
    isFull,
    userVaultShares,
  }),
  queryFn: async ({ marketId, withdrawAmount, isFull, userVaultShares }: WithdrawQuery) =>
    await (isFull
      ? requireVault(marketId).vault.estimateGas.redeem(userVaultShares)
      : requireVault(marketId).vault.estimateGas.withdraw(withdrawAmount)),
  category: 'llamalend.supply',
  validationSuite: withdrawValidationSuite,
})

export const useWithdrawEstimateGas = createEstimateGasHook(useWithdrawEstimateGasQuery)
