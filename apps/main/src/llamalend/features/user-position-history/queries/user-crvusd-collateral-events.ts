import { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Chain } from '@curvefi/prices-api'
import { getUserMarketCollateralEvents, type UserCollateralEvents } from '@curvefi/prices-api/crvusd'
import { NETWORK_BASE_CONFIG } from '@ui/utils'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

type UserCrvUsdCollateralEventsQuery = ChainQuery<IChainId> & { controllerAddress: string; userAddress: string }
type UserCrvUsdCollateralEventsParams = FieldsOf<UserCrvUsdCollateralEventsQuery>

export const { useQuery: useUserCrvUsdCollateralEventsQuery, invalidate: invalidateUserCrvUsdCollateralEventsQuery } =
  queryFactory({
    queryKey: ({ chainId, controllerAddress, userAddress }: UserCrvUsdCollateralEventsParams) =>
      ['userCrvUsdCollateralEvents', { chainId }, { controllerAddress }, { userAddress }, 'v1'] as const,
    queryFn: async ({
      chainId,
      controllerAddress,
      userAddress,
    }: UserCrvUsdCollateralEventsQuery): Promise<UserCollateralEvents> => {
      const chain = NETWORK_BASE_CONFIG[chainId].id as Chain
      return await getUserMarketCollateralEvents(userAddress, chain, controllerAddress)
    },
    refetchInterval: '1m',
    validationSuite: llamaApiValidationSuite,
  })
