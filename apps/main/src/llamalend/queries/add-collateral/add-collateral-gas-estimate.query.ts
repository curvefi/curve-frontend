import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { createApprovedEstimateGasHook } from '@ui-kit/lib/model/entities/gas-info'
import type { CollateralQuery } from '../validation/manage-loan.types'
import { collateralValidationSuite } from '../validation/manage-loan.validation'
import { useAddCollateralIsApproved } from './add-collateral-approved.query'

type AddCollateralGasQuery<T = IChainId> = CollateralQuery<T>
type AddCollateralGasParams<T = IChainId> = FieldsOf<AddCollateralGasQuery<T>>

const { useQuery: useAddCollateralApproveGasEstimate } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: AddCollateralGasParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.addCollateralApprove',
      { userCollateral },
    ] as const,
  queryFn: async ({ marketId, userCollateral }: AddCollateralGasQuery) =>
    await getLoanImplementation(marketId).estimateGas.addCollateralApprove(userCollateral),
  category: 'llamalend.addCollateral',
  validationSuite: collateralValidationSuite,
})

const { useQuery: useAddCollateralGasEstimate } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: AddCollateralGasParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.addCollateral',
      { userCollateral },
    ] as const,
  queryFn: async ({ marketId, userCollateral }: AddCollateralGasQuery) =>
    await getLoanImplementation(marketId).estimateGas.addCollateral(userCollateral),
  category: 'llamalend.addCollateral',
  validationSuite: collateralValidationSuite,
})

export const useAddCollateralEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useAddCollateralIsApproved,
  useApproveEstimate: useAddCollateralApproveGasEstimate,
  useActionEstimate: useAddCollateralGasEstimate,
})
