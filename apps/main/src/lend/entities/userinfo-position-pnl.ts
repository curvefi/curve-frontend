import type { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { queryFactory } from '@ui-kit/lib/model/query'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { userMarketValidationGroup } from './validation/market-validation'

async function _fetchUserInfoPositionPnl({
  market,
  rOwmId,
  userAddress,
}: {
  market: OneWayMarketTemplate
  rOwmId: string
  userAddress: string
}) {
  return market.currentPnL(userAddress)
}

const positionPnlValidationSuite = createValidationSuite(
  (params: { market: OneWayMarketTemplate; rOwmId: string; userAddress: string }) => {
    userMarketValidationGroup(params)
    userAddressValidationGroup(params)
  },
)

export const { useQuery: useUserInfoPositionPnl } = queryFactory({
  queryKey: (params: { market: OneWayMarketTemplate; rOwmId: string; userAddress: string }) =>
    [
      'userInfoPositionPnl',
      { market: params.market },
      { rOwmId: params.rOwmId },
      { userAddress: params.userAddress },
    ] as const,
  queryFn: _fetchUserInfoPositionPnl,
  staleTime: '5m',
  validationSuite: positionPnlValidationSuite,
})
