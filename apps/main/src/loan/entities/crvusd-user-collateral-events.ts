import type { UserCollateralEvents } from '@curvefi/prices-api/crvusd/models'
import type { Chain } from '@curvefi/prices-api'
import { queryFactory } from '@ui-kit/lib/model/query'
import { getUserMarketCollateralEvents } from '@curvefi/prices-api/crvusd'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { enforce, group, test } from 'vest'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { isAddress } from 'viem'

export type UserCollateralEventsParams = {
  userAddress: string
  chain: Chain
  marketController: string
}

// Create a validation group for market controller
const marketControllerValidationGroup = ({ marketController }: Pick<UserCollateralEventsParams, 'marketController'>) =>
  group('marketControllerValidation', () => {
    test('marketController', 'Market controller is required', () => {
      enforce(marketController).isNotEmpty()
    })

    test('marketController', 'Invalid EVM address', () => {
      enforce(isAddress(marketController)).equals(true)
    })
  })

// Create a combined validation suite that includes both user address and market controller validation
const userCollateralEventsValidationSuite = createValidationSuite((params: UserCollateralEventsParams) => {
  userAddressValidationGroup(params)
  marketControllerValidationGroup(params)
})

async function _fetchUserMarketCollateralEvents(params: UserCollateralEventsParams): Promise<UserCollateralEvents> {
  const { userAddress, chain, marketController } = params
  return await getUserMarketCollateralEvents(userAddress, chain, marketController)
}

export const { useQuery: useUserMarketCollateralEvents } = queryFactory({
  queryKey: (params: UserCollateralEventsParams) =>
    [
      'userMarketCollateralEvents',
      { userAddress: params.userAddress },
      { chain: params.chain },
      { marketController: params.marketController },
    ] as const,
  queryFn: _fetchUserMarketCollateralEvents,
  staleTime: '5m',
  validationSuite: userCollateralEventsValidationSuite,
})
