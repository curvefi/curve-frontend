import { userDepositParamsValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery, UserDepositParams } from '@/dex/features/deposit/types'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import { createApprovedEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { getDepositType, getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { useDepositIsApproved } from './deposit-approved.query'

const { useQuery: useDepositApproveEstimate } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, decimals, ...values }: UserDepositParams) => ({
    name: 'estimateGas.depositApprove',
    ...rootKeys.userPool({ chainId, poolId, userAddress }),
    isWrapped,
    amounts: getPoolAmounts(values, decimals?.length),
  }),
  queryFn: async ({ poolId, isWrapped, decimals, ...params }: DepositQuery) =>
    await requireLib('curveApi')
      .getPool(poolId)
      .estimateGas[`${getDepositType(isWrapped)}Approve`](getPoolAmounts(params, decimals.length) as Decimal[]),
  category: 'dex.pool',
  validationSuite: userDepositParamsValidationSuite,
})

const { useQuery: useDepositEstimate } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, slippage, decimals, ...values }: UserDepositParams) => ({
    name: 'estimateGas.deposit',
    ...rootKeys.userPool({ chainId, poolId, userAddress }),
    isWrapped,
    amounts: getPoolAmounts(values, decimals?.length),
    slippage,
  }),
  queryFn: async ({ poolId, isWrapped, slippage, decimals, ...values }: DepositQuery) =>
    await requireLib('curveApi')
      .getPool(poolId)
      .estimateGas[getDepositType(isWrapped)](getPoolAmounts(values, decimals?.length) as Decimal[], +slippage),
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
