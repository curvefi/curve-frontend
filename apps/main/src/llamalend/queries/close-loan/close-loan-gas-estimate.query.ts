import { getLlamaMarket } from '@/llamalend/llama.utils'
import { useCloseLoanIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { createApprovedEstimateGasHook } from '@ui-kit/lib/model/entities/gas-info'
import type { CloseLoanParams, CloseLoanQuery } from '../validation/manage-loan.types'
import { closeLoanValidationSuite } from '../validation/manage-loan.validation'

const { useQuery: useCloseLoanEstimateGas } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, slippage }: CloseLoanParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.selfLiquidate', { slippage }] as const,
  queryFn: async ({ marketId, slippage }: CloseLoanQuery): Promise<TGas> =>
    await getLlamaMarket(marketId).estimateGas.selfLiquidate(Number(slippage)),
  staleTime: '1m',
  validationSuite: closeLoanValidationSuite,
})

const { useQuery: useCloseApproveGasEstimate } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, slippage }: CloseLoanParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.selfLiquidate', { slippage }] as const,
  queryFn: async ({ marketId, slippage }: CloseLoanQuery): Promise<TGas> =>
    await getLlamaMarket(marketId).estimateGas.selfLiquidate(Number(slippage)),
  staleTime: '1m',
  validationSuite: closeLoanValidationSuite,
})

export const useCloseEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useCloseLoanIsApproved,
  useApproveEstimate: useCloseApproveGasEstimate,
  useActionEstimate: useCloseLoanEstimateGas,
})
