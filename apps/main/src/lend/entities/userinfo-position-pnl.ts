import type { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { queryFactory } from '@ui-kit/lib/model/query'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'

async function _fetchUserInfoPositionPnl({
  market,
  userAddress,
}: {
  market: OneWayMarketTemplate
  userAddress: string
}) {
  return market.currentPnL(userAddress)
}

const positionPnlValidationSuite = createValidationSuite(
  (params: { market: OneWayMarketTemplate; userAddress: string }) => {
    // marketValidationGroup(params)
    userAddressValidationGroup(params)
  },
)

export const { useQuery: useUserInfoPositionPnl } = queryFactory({
  queryKey: (params: { market: OneWayMarketTemplate; userAddress: string }) =>
    ['userInfoPositionPnl', { market: params.market }, { userAddress: params.userAddress }] as const,
  queryFn: _fetchUserInfoPositionPnl,
  staleTime: '5m',
  validationSuite: positionPnlValidationSuite,
})
