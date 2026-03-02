import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { CollateralQuery } from '../validation/manage-loan.types'
import { collateralValidationSuite } from '../validation/manage-loan.validation'

type AddCollateralIsApprovedQuery<T = IChainId> = CollateralQuery<T>
type AddCollateralIsApprovedParams<T = IChainId> = FieldsOf<AddCollateralIsApprovedQuery<T>>

export const { useQuery: useAddCollateralIsApproved, fetchQuery: fetchAddCollateralIsApproved } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: AddCollateralIsApprovedParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'addCollateralIsApproved',
      { userCollateral },
    ] as const,
  queryFn: async ({ marketId, userCollateral }: AddCollateralIsApprovedQuery): Promise<boolean> =>
    await getLlamaMarket(marketId).addCollateralIsApproved(userCollateral),
  category: 'llamalend.addCollateral',
  validationSuite: collateralValidationSuite,
})
