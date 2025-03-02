import type { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { queryFactory } from '@ui-kit/lib/model/query'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { userMarketValidationGroup } from './validation/market-validation'

async function _fetchUserInfoPositionLeverage({
  market,
  userAddress,
}: {
  market: OneWayMarketTemplate
  userAddress: string
}) {
  return market.currentLeverage(userAddress)
}

const positionLeverageValidationSuite = createValidationSuite(
  (params: { market: OneWayMarketTemplate; userAddress: string }) => {
    userMarketValidationGroup(params)
    userAddressValidationGroup(params)
  },
)

export const { useQuery: useUserInfoPositionLeverage } = queryFactory({
  queryKey: (params: { market: OneWayMarketTemplate; userAddress: string }) =>
    ['userInfoPositionLeverage', { market: params.market }, { userAddress: params.userAddress }] as const,
  queryFn: _fetchUserInfoPositionLeverage,
  staleTime: '5m',
  validationSuite: positionLeverageValidationSuite,
})
