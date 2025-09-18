import type { Address } from 'viem'
import { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Chain } from '@curvefi/prices-api'
import { getUserMarketCollateralEvents, type UserCollateralEvents } from '@curvefi/prices-api/lending'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { userCollateralEventsValidationSuite } from './validation/user-collateral-events-validation'

type UserLendCollateralEventsQuery = ChainQuery<IChainId> & {
  chain: Chain
  controllerAddress: Address | undefined
  userAddress: Address | undefined
}
type UserLendCollateralEventsParams = FieldsOf<UserLendCollateralEventsQuery>

export const { useQuery: useUserLendCollateralEventsQuery, invalidate: invalidateUserLendCollateralEventsQuery } =
  queryFactory({
    queryKey: ({ chainId, chain, controllerAddress, userAddress }: UserLendCollateralEventsParams) =>
      ['userLendCollateralEvents', { chainId }, { chain }, { controllerAddress }, { userAddress }, 'v1'] as const,
    queryFn: async ({
      chain,
      controllerAddress,
      userAddress,
    }: UserLendCollateralEventsQuery): Promise<UserCollateralEvents> =>
      await getUserMarketCollateralEvents(userAddress!, chain, controllerAddress!),
    refetchInterval: '1m',
    validationSuite: userCollateralEventsValidationSuite,
  })
