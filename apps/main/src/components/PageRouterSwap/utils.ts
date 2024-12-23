import type { FormValues, Route } from '@/components/PageRouterSwap/types'
import type { IRouteStep } from '@curvefi/api/lib/interfaces'
import type { FormStatus } from '@/components/PageRouterSwap/types'

import isUndefined from 'lodash/isUndefined'
import orderBy from 'lodash/orderBy'
import uniq from 'lodash/uniq'

import { NETWORK_TOKEN } from '@/constants'
import { log } from '@ui-kit/lib/logging'
import { weiToEther } from '@ui-kit/utils'

export const DEFAULT_FORM_STATUS: FormStatus = {
  isApproved: false,
  formProcessing: false,
  formTypeCompleted: '',
  step: '',
  error: '',
  swapError: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  isFrom: null,
  fromAmount: '',
  fromError: '',
  toAmount: '',
}

export function sortTokensByGasFees(
  userBalancesMapper: UserBalancesMapper,
  usdRatesMapper: UsdRatesMapper,
  selectToList: string[],
  firstBasePlusPriority: number,
) {
  const GAS_USED = 250000
  const networkTokenUsdRate = usdRatesMapper[NETWORK_TOKEN] ?? 1
  const gasFees = weiToEther(GAS_USED * firstBasePlusPriority) * networkTokenUsdRate

  const userBalancesUsd = Object.keys(userBalancesMapper)
    .map((t) => ({ address: t, userBalancesUsd: +(userBalancesMapper[t] ?? '0') * +(usdRatesMapper[t] ?? '1') }))
    .filter(({ userBalancesUsd }) => userBalancesUsd > gasFees)

  // only allow user tokens with usd balance > gasFees to be visible at top and order by balance
  const userTokensGreaterThanGasFees = orderBy(userBalancesUsd, ({ userBalancesUsd }) => userBalancesUsd, ['desc']).map(
    ({ address }) => address,
  )

  return uniq([...userTokensGreaterThanGasFees, ...selectToList])
}

export function parseRouterRoutes(
  routes: IRouteStep[],
  poolsMapper: { [poolId: string]: PoolData },
  getPool: (poolId: string) => Pool,
) {
  let haveCryptoRoutes = false
  let parsedRoutes: Route[] = []

  if (Array.isArray(routes) && routes.length > 0) {
    parsedRoutes = routes.map((route) => {
      let pool = poolsMapper[route.poolId]?.pool

      if (isUndefined(pool)) {
        try {
          pool = getPool(route.poolId)
        } catch (error) {
          log('routerBestRouteAndOutput missing poolName', route)
        }
      }

      const poolName = pool ? pool.name : route.poolId

      if (pool && pool.isCrypto) {
        haveCryptoRoutes = true
      }

      return { ...route, name: poolName, routeUrlId: pool ? route.poolId : '' }
    })
  }

  return { haveCryptoRoutes, routes: parsedRoutes }
}
