import { userDepositParamsValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery, UserDepositParams } from '@/dex/features/deposit/types'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import { createApprovedEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { depositMethod } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { useDepositIsApproved } from './deposit-approved.query'

const { useQuery: useDepositApproveEstimate } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, amounts }: UserDepositParams) => ({
    name: 'estimateGas.depositApprove',
    ...rootKeys.userPool({ chainId, poolId, userAddress }),
    isWrapped,
    amounts,
  }),
  queryFn: async ({ poolId, isWrapped, amounts }: DepositQuery) =>
    await requireLib('curveApi').getPool(poolId).estimateGas[`${depositMethod(isWrapped)}Approve`](amounts),
  category: 'dex.pool',
  validationSuite: userDepositParamsValidationSuite,
})

const { useQuery: useDepositEstimate } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, slippage, amounts }: UserDepositParams) => ({
    name: 'estimateGas.deposit',
    ...rootKeys.userPool({ chainId, poolId, userAddress }),
    isWrapped,
    slippage,
    amounts,
  }),
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

export const useDepositEstimateGas = (params: DepositParams) => {
  const { isHydrated } = useCurve()
  return useDepositEstimateGasQuery(params, isHydrated)
}
