import { depositQueryValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery } from '@/dex/features/deposit/types'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import { createApprovedEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { useDepositIsApproved } from './deposit-approved.query'
import { getDepositAmounts } from './deposit.utils'

const { useQuery: useDepositApproveEstimate } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, decimals, ...values }: DepositParams) => ({
    name: 'estimateGas.depositApprove',
    ...rootKeys.userPool({ chainId, poolId, userAddress }),
    isWrapped,
    amounts: getPoolAmounts(values, decimals?.length),
  }),
  queryFn: async (params: DepositQuery) => {
    const pool = requireLib('curveApi').getPool(params.poolId)
    const amounts = getDepositAmounts(params)
    return params.isWrapped
      ? await pool.estimateGas.depositWrappedApprove(amounts)
      : await pool.estimateGas.depositApprove(amounts)
  },
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})

const { useQuery: useDepositEstimate } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, slippage, decimals, ...values }: DepositParams) => ({
    name: 'estimateGas.deposit',
    ...rootKeys.userPool({ chainId, poolId, userAddress }),
    isWrapped,
    amounts: getPoolAmounts(values, decimals?.length),
    slippage,
  }),
  queryFn: async (params: DepositQuery) => {
    const pool = requireLib('curveApi').getPool(params.poolId)
    const amounts = getDepositAmounts(params)
    return params.isWrapped
      ? await pool.estimateGas.depositWrapped(amounts, Number(params.slippage))
      : await pool.estimateGas.deposit(amounts, Number(params.slippage))
  },
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
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
