import type { Address } from 'viem'
import { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Chain } from '@curvefi/prices-api'
import { getUserMarketCollateralEvents, type UserCollateralEvents } from '@curvefi/prices-api/lending'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { ChainQuery, ChainNameQuery } from '@ui-kit/lib/model/query'
import { userCollateralEventsValidationSuite } from './validation/user-collateral-events-validation'

type UserLendCollateralEventsQuery = ChainQuery<IChainId> &
  ChainNameQuery<Chain> & {
    controllerAddress: Address | undefined
    userAddress: Address | undefined
  }
type UserLendCollateralEventsParams = FieldsOf<UserLendCollateralEventsQuery>

export const { useQuery: useUserLendCollateralEventsQuery, invalidate: invalidateUserLendCollateralEventsQuery } =
  queryFactory({
    queryKey: ({ chainId, blockchainId, controllerAddress, userAddress }: UserLendCollateralEventsParams) =>
      [
        'userLendCollateralEvents',
        { chainId },
        { blockchainId },
        { controllerAddress },
        { userAddress },
        'v1',
      ] as const,
    queryFn: async ({
      blockchainId,
      controllerAddress,
      userAddress,
    }: UserLendCollateralEventsQuery): Promise<UserCollateralEvents> =>
      await getUserMarketCollateralEvents(userAddress!, blockchainId, controllerAddress!),
    refetchInterval: '1m',
    validationSuite: userCollateralEventsValidationSuite,
  })
