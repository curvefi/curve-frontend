import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId, TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { useEstimateGas } from '@ui-kit/lib/model/entities/gas-info'
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

    if (isApproved) {
      return market.estimateGas.addCollateral(userCollateral)
    }
    // When not approved, sum both approval gas and addCollateral gas
    const [approveGas, addCollateralGas] = await Promise.all([
      market.estimateGas.addCollateralApprove(userCollateral),
      market.estimateGas.addCollateral(userCollateral),
    ])
    return (Number(approveGas) + Number(addCollateralGas)) as TGas
  },
  category: 'user',
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
  } = useEstimateGas(networks, chainId, estimate, enabled)
  return { data, isLoading: estimateLoading || conversionLoading, error: estimateError ?? conversionError }
}
