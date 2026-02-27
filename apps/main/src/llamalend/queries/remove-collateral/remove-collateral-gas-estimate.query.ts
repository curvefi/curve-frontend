import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { useEstimateGas } from '@ui-kit/lib/model/entities/gas-info'
import type { CollateralQuery } from '../validation/manage-loan.types'
import { collateralValidationSuite } from '../validation/manage-loan.validation'
import { maxRemovableCollateralKey } from './remove-collateral-max-removable.query'

type RemoveCollateralGasQuery<T = IChainId> = CollateralQuery<T>
type RemoveCollateralGasParams<T = IChainId> = FieldsOf<RemoveCollateralGasQuery<T>>

const { useQuery: useRemoveCollateralGasEstimate } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: RemoveCollateralGasParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'remove-collateral-gas-estimation',
      { userCollateral },
    ] as const,
  queryFn: async ({ marketId, userCollateral }: RemoveCollateralGasQuery) => {
    const market = getLlamaMarket(marketId)
    return await market.removeCollateralEstimateGas(userCollateral)
  },
  category: 'user',
  validationSuite: collateralValidationSuite,
  dependencies: (params) => [maxRemovableCollateralKey(params)],
})

export const useRemoveCollateralEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: RemoveCollateralGasParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const {
    data: estimate,
    isLoading: estimateLoading,
    error: estimateError,
  } = useRemoveCollateralGasEstimate(query, enabled)
  const {
    data,
    isLoading: conversionLoading,
    error: conversionError,
  } = useEstimateGas(networks, chainId, estimate, enabled)
  return { data, isLoading: estimateLoading || conversionLoading, error: estimateError ?? conversionError }
}
