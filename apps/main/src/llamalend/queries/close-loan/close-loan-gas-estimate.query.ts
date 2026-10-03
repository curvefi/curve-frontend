import { useCloseLoanIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { createApprovedEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import type { UserMarketQuery } from '@evm-ui/queries/query-types'
import { queryFactory } from '@ui/features/queries/factory'
import type { CloseLoanParams, CloseLoanQuery } from '../validation/manage-loan.types'
import { closeLoanValidationSuite } from '../validation/manage-loan.validation'

const { useQuery: useCloseLoanEstimateGas } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, slippage }: CloseLoanParams) => ({
    name: 'estimateGas.selfLiquidate',
    chainId,
    marketId,
    userAddress,
    slippage,
  }),
  queryFn: async ({ marketId, slippage }: CloseLoanQuery): Promise<TGas> =>
    await getLoanImplementation(marketId).estimateGas.selfLiquidate(Number(slippage)),
  category: 'llamalend.closeLoan',
  validationSuite: closeLoanValidationSuite,
})

const { useQuery: useCloseApproveGasEstimate } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: CloseLoanParams) => ({
    name: 'estimateGas.selfLiquidateApprove',
    chainId,
    marketId,
    userAddress,
  }),
  queryFn: async ({ marketId }: UserMarketQuery): Promise<TGas> =>
    await getLoanImplementation(marketId).estimateGas.selfLiquidateApprove(),
  category: 'llamalend.closeLoan',
  validationSuite: closeLoanValidationSuite,
})

export const useCloseEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useCloseLoanIsApproved,
  useApproveEstimate: useCloseApproveGasEstimate,
  useActionEstimate: useCloseLoanEstimateGas,
})
