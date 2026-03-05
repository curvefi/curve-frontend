import { getLlamaMarket } from '@/llamalend/llama.utils'
import { useCloseLoanIsApproved } from '@/llamalend/queries/close-loan/close-loan-is-approved.query'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys, type UserMarketQuery } from '@ui-kit/lib/model'
import { createApprovedEstimateGasHook } from '@ui-kit/lib/model/entities/gas-info'
import type { CloseLoanParams, CloseLoanQuery } from '../validation/manage-loan.types'
import { closeLoanValidationSuite } from '../validation/manage-loan.validation'

const { useQuery: useCloseLoanEstimateGas } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, slippage }: CloseLoanParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.selfLiquidate', { slippage }] as const,
  queryFn: async ({ marketId, slippage }: CloseLoanQuery): Promise<TGas> => {
    const market = getLlamaMarket(marketId)
    const loan = 'loan' in market ? market.loan : market
    return await loan.estimateGas.selfLiquidate(Number(slippage))
  },
  category: 'llamalend.closeLoan',
  validationSuite: closeLoanValidationSuite,
})

const { useQuery: useCloseApproveGasEstimate } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: CloseLoanParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.selfLiquidateApprove'] as const,
  queryFn: async ({ marketId }: UserMarketQuery): Promise<TGas> => {
    const market = getLlamaMarket(marketId)
    return 'loan' in market
      ? await (
          market.loan as unknown as { selfLiquidateApproveEstimateGas: () => Promise<TGas> }
        ).selfLiquidateApproveEstimateGas()
      : await market.estimateGas.selfLiquidateApprove()
  },
  category: 'llamalend.closeLoan',
  validationSuite: closeLoanValidationSuite,
})

export const useCloseEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useCloseLoanIsApproved,
  useApproveEstimate: useCloseApproveGasEstimate,
  useActionEstimate: useCloseLoanEstimateGas,
})
