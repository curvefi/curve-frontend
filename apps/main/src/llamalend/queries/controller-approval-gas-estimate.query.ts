import { getMarket } from '@/llamalend/llama.utils'
import { createEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import type { UserMarketQuery } from '@evm-ui/queries/query-types'
import { userMarketValidationSuite } from '@evm-ui/queries/validation/user-market-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { FieldsOf } from '@ui/lib/validation/types'

type Params = FieldsOf<UserMarketQuery>

const { useQuery: useControllerApprovalEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: Params) => ({
    name: 'estimateGas.setControllerApproval',
    chainId,
    marketId,
    userAddress,
  }),
  queryFn: async ({ marketId }: UserMarketQuery) =>
    await getMarket(marketId).leverageZapV2.estimateGas.setControllerApproval(),
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})

export const useControllerApprovalEstimateGas = createEstimateGasHook(useControllerApprovalEstimateGasQuery)
