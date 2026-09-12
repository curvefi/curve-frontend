import { getUserMarketCollateralEvents, type UserCollateralEvents } from '@curvefi/prices-api/crvusd'
import { type UserContractParams, type UserContractQuery } from '@evm-ui/lib/model/query'
import { queryFactory } from '@ui/features/queries/factory'
import { userCollateralEventsValidationSuite } from './validation/user-collateral-events-validation'

export const { useQuery: useUserCrvUsdCollateralEventsQuery, invalidate: invalidateUserCrvUsdCollateralEventsQuery } =
  queryFactory({
    queryKey: ({ blockchainId, userAddress, contractAddress }: UserContractParams) =>
      ['userCrvUsdCollateralEvents', { blockchainId }, { userAddress }, { contractAddress }, 'v1'] as const,
    queryFn: ({ blockchainId, contractAddress, userAddress }: UserContractQuery): Promise<UserCollateralEvents> =>
      getUserMarketCollateralEvents(userAddress, blockchainId, contractAddress),
    category: 'llamalend.user',
    validationSuite: userCollateralEventsValidationSuite,
  })
