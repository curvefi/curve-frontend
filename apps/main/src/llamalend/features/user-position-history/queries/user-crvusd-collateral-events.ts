import { getUserMarketCollateralEvents, type UserCollateralEvents } from '@curvefi/prices-api/crvusd'
import type { UserContractParams, UserContractQuery } from '@evm-ui/queries/query-types'
import { queryFactory } from '@ui/features/queries/factory'
import { userCollateralEventsValidationSuite } from './validation/user-collateral-events-validation'

export const { useQuery: useUserCrvUsdCollateralEventsQuery, invalidate: invalidateUserCrvUsdCollateralEventsQuery } =
  queryFactory({
    queryKey: ({ blockchainId, userAddress, contractAddress }: UserContractParams) =>
      ({ name: 'userCrvUsdCollateralEvents', version: 1, blockchainId, userAddress, contractAddress }) as const,
    queryFn: ({ blockchainId, contractAddress, userAddress }: UserContractQuery): Promise<UserCollateralEvents> =>
      getUserMarketCollateralEvents(userAddress, blockchainId, contractAddress),
    category: 'llamalend.user',
    validationSuite: userCollateralEventsValidationSuite,
  })
