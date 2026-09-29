import { getMarket } from '@/llamalend/llama.utils'
import { createEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { rootKeys, type UserMarketQuery } from '@evm-ui/queries/root-keys'
import { userMarketValidationSuite } from '@evm-ui/queries/validation/user-market-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { FieldsOf } from '@ui/lib/validation/types'

type Params = FieldsOf<UserMarketQuery>

const { useQuery: useControllerApprovalEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: Params) => ({
    ...rootKeys.userMarket({ chainId, marketId, userAddress }),
    name: 'estimateGas.setControllerApproval',
  }),
  queryFn: async ({ marketId }: UserMarketQuery) =>
    await getMarket(marketId).leverageZapV2.estimateGas.setControllerApproval(),
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})

export const useControllerApprovalEstimateGas = createEstimateGasHook(useControllerApprovalEstimateGasQuery)
