import { getMarket, isLendMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { createEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { queryFactory } from '@ui/features/queries/factory'
import { type FieldsOf } from '@ui/lib/validation/types'
import type { CollateralQuery } from '../validation/manage-loan.types'
import { collateralValidationSuite } from '../validation/manage-loan.validation'
import { maxRemovableCollateralKey } from './remove-collateral-max-removable.query'

type RemoveCollateralGasQuery<T = IChainId> = CollateralQuery<T>
type RemoveCollateralGasParams<T = IChainId> = FieldsOf<RemoveCollateralGasQuery<T>>

const { useQuery: useRemoveCollateralGasEstimate } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: RemoveCollateralGasParams) =>
    ({ name: 'estimateGas.removeCollateral', chainId, marketId, userAddress, userCollateral }) as const,
  queryFn: async ({ marketId, userCollateral }: RemoveCollateralGasQuery) => {
    const market = getMarket(marketId)
    return isLendMarket(market)
      ? market.loan.estimateGas.removeCollateral(userCollateral)
      : market.removeCollateralEstimateGas(userCollateral)
  },
  category: 'llamalend.removeCollateral',
  validationSuite: collateralValidationSuite,
  dependencies: params => [maxRemovableCollateralKey(params)],
})

export const useRemoveCollateralEstimateGas = createEstimateGasHook(useRemoveCollateralGasEstimate)
