import { getUserMarketCollateralEvents, type UserCollateralEvents } from '@curvefi/prices-api/crvusd'
import type { Address } from '@primitives/address.utils'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { UserQuery, ContractQuery } from '@ui-kit/lib/model/query'
import { userCollateralEventsValidationSuite } from './validation/user-collateral-events-validation'

type UserCrvUsdCollateralEventsQuery = UserQuery<Address> & ContractQuery
type UserCrvUsdCollateralEventsParams = FieldsOf<UserCrvUsdCollateralEventsQuery>

export const { useQuery: useUserCrvUsdCollateralEventsQuery } = queryFactory({
  queryKey: ({ blockchainId, userAddress, contractAddress }: UserCrvUsdCollateralEventsParams) =>
    ['userCrvUsdCollateralEvents', { blockchainId }, { userAddress }, { contractAddress }, 'v1'] as const,
  queryFn: ({
    blockchainId,
    contractAddress,
    userAddress,
  }: UserCrvUsdCollateralEventsQuery): Promise<UserCollateralEvents> =>
    getUserMarketCollateralEvents(userAddress, blockchainId, contractAddress!),
  category: 'llamalend.user',
  validationSuite: userCollateralEventsValidationSuite,
})
