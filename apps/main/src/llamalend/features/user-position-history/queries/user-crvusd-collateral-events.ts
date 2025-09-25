import type { Address } from 'viem'
import { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Chain } from '@curvefi/prices-api'
import { getUserMarketCollateralEvents, type UserCollateralEvents } from '@curvefi/prices-api/crvusd'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { ChainQuery, UserQuery, ContractQuery } from '@ui-kit/lib/model/query'
import { userCollateralEventsValidationSuite } from './validation/user-collateral-events-validation'

type UserCrvUsdCollateralEventsQuery = ChainQuery<IChainId> & UserQuery<Address> & ContractQuery<Chain>
type UserCrvUsdCollateralEventsParams = FieldsOf<UserCrvUsdCollateralEventsQuery>

export const { useQuery: useUserCrvUsdCollateralEventsQuery, invalidate: invalidateUserCrvUsdCollateralEventsQuery } =
  queryFactory({
    queryKey: ({ chainId, blockchainId, userAddress, contractAddress }: UserCrvUsdCollateralEventsParams) =>
      [
        'userCrvUsdCollateralEvents',
        { chainId },
        { blockchainId },
        { userAddress },
        { contractAddress },
        'v1',
      ] as const,
    queryFn: async ({
      blockchainId,
      contractAddress,
      userAddress,
    }: UserCrvUsdCollateralEventsQuery): Promise<UserCollateralEvents> =>
      await getUserMarketCollateralEvents(userAddress!, blockchainId, contractAddress!),
    refetchInterval: '1m',
    validationSuite: userCollateralEventsValidationSuite,
  })
