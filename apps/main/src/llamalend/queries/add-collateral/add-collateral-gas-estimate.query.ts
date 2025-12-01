import { useEstimateGas } from '@/llamalend/hooks/useEstimateGas'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { CollateralQuery } from '../validation/manage-loan.types'
import { collateralValidationSuite } from '../validation/manage-loan.validation'

type AddCollateralGasQuery<T = IChainId> = CollateralQuery<T>
type AddCollateralGasParams<T = IChainId> = FieldsOf<AddCollateralGasQuery<T>>

const { useQuery: useAddCollateralGasEstimate } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: AddCollateralGasParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'add-collateral-gas-estimation',
      { userCollateral },
    ] as const,
  queryFn: async ({ marketId, userCollateral }: AddCollateralGasQuery) => {
    const market = getLlamaMarket(marketId)
    const isApproved = await market.addCollateralIsApproved(userCollateral)
    const result = isApproved
      ? await market.estimateGas.addCollateral(userCollateral)
      : await market.estimateGas.addCollateralApprove(userCollateral)
    return result
  },
  validationSuite: collateralValidationSuite,
})

export const useAddCollateralEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: AddCollateralGasParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const {
    data: estimate,
    isLoading: estimateLoading,
    error: estimateError,
  } = useAddCollateralGasEstimate(query, enabled)
  const {
    data,
    isLoading: conversionLoading,
    error: conversionError,
  } = useEstimateGas<ChainId>(networks, chainId, estimate, enabled)
  return { data, isLoading: estimateLoading || conversionLoading, error: estimateError ?? conversionError }
}
