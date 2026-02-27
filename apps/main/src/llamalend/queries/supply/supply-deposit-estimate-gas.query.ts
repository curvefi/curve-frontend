import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { createApprovedEstimateGasHook } from '@ui-kit/lib/model/entities/gas-info'
import { DepositParams, DepositQuery, depositValidationSuite, requireVault } from '../validation/supply.validation'
import { useDepositIsApproved } from './supply-deposit-approved.query'

const { useQuery: useDepositApproveEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, depositAmount }: DepositParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.depositApprove',
      { depositAmount },
    ] as const,
  queryFn: async ({ marketId, depositAmount }: DepositQuery) =>
    await requireVault(marketId).vault.estimateGas.depositApprove(depositAmount),
  category: 'llamalend.supply',
  validationSuite: depositValidationSuite,
})

const { useQuery: useDepositEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, depositAmount }: DepositParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.deposit', { depositAmount }] as const,
  queryFn: async ({ marketId, depositAmount }: DepositQuery) =>
    await requireVault(marketId).vault.estimateGas.deposit(depositAmount),
  category: 'llamalend.supply',
  validationSuite: depositValidationSuite,
})

export const useDepositEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useDepositIsApproved,
  useApproveEstimate: useDepositApproveEstimateGasQuery,
  useActionEstimate: useDepositEstimateGasQuery,
})
