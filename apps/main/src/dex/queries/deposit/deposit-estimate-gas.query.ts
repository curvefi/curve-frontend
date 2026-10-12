import { userDepositParamsValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery, UserDepositParams } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import { createApprovedEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { depositMethod } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { useDepositIsApproved } from './deposit-approved.query'

const { useQuery: useDepositApproveEstimate } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, amounts }: UserDepositParams) =>
    ({ name: 'estimateGas.depositApprove', chainId, poolId, userAddress, isWrapped, amounts }) as const,
  queryFn: async ({ poolId, isWrapped, amounts }: DepositQuery) =>
    await requireLib('curveApi').getPool(poolId).estimateGas[`${depositMethod(isWrapped)}Approve`](amounts),
  category: 'dex.pool',
  validationSuite: userDepositParamsValidationSuite,
})

const { useQuery: useDepositEstimate } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, slippage, amounts }: UserDepositParams) =>
    ({ name: 'estimateGas.deposit', chainId, poolId, userAddress, isWrapped, slippage, amounts }) as const,
  queryFn: async ({ poolId, isWrapped, slippage, amounts }: DepositQuery) =>
    await requireLib('curveApi').getPool(poolId).estimateGas[depositMethod(isWrapped)](amounts, +slippage),
  category: 'dex.pool',
  validationSuite: userDepositParamsValidationSuite,
})

const useDepositEstimateGasQuery = createApprovedEstimateGasHook({
  useIsApproved: useDepositIsApproved,
  useApproveEstimate: useDepositApproveEstimate,
  useActionEstimate: useDepositEstimate,
})

export const useDepositEstimateGas = (params: DepositParams, enabled?: boolean) =>
  useHydratedQuery(useDepositEstimateGasQuery, params, enabled)
