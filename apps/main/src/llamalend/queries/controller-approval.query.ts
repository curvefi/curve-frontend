import { getMarket } from '@/llamalend/llama.utils'
import type { UserMarketQuery } from '@evm-ui/lib/model'
import { rootKeys } from '@evm-ui/lib/model'
import { createEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'
import { userMarketValidationSuite } from '@evm-ui/lib/model/query/user-market-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { FieldsOf } from '@ui/lib/validation/types'

type Params = FieldsOf<UserMarketQuery>

export const { useQuery: useIsControllerApproval, fetchQuery: fetchIsControllerApproved } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: Params) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'isControllerApproved'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    await getMarket(marketId).leverageZapV2.isControllerApproved(userAddress),
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})

const { useQuery: useControllerApprovalEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: Params) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.setControllerApproval'] as const,
  queryFn: async ({ marketId }: UserMarketQuery) =>
    await getMarket(marketId).leverageZapV2.estimateGas.setControllerApproval(),
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})

export const useControllerApprovalEstimateGas = createEstimateGasHook(useControllerApprovalEstimateGasQuery)
