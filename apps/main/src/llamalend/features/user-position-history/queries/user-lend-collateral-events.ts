import { getUserMarketCollateralEvents, type UserCollateralEvents } from '@curvefi/prices-api/lending'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { UserQuery, ContractQuery } from '@ui-kit/lib/model/query'
import { userCollateralEventsValidationSuite } from './validation/user-collateral-events-validation'

type UserLendCollateralEventsQuery = UserQuery & ContractQuery
type UserLendCollateralEventsParams = FieldsOf<UserLendCollateralEventsQuery>

export const { useQuery: useUserLendCollateralEventsQuery, invalidate: invalidateUserLendCollateralEventsQuery } =
  queryFactory({
    queryKey: ({ blockchainId, userAddress, contractAddress }: UserLendCollateralEventsParams) =>
      ['userLendCollateralEvents', { blockchainId }, { userAddress }, { contractAddress }, 'v1'] as const,
    queryFn: ({
      blockchainId,
      contractAddress,
      userAddress,
    }: UserLendCollateralEventsQuery): Promise<UserCollateralEvents> =>
      getUserMarketCollateralEvents(userAddress, blockchainId, contractAddress),
    category: 'llamalend.user',
    validationSuite: userCollateralEventsValidationSuite,
  })
