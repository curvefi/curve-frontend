import lodash from 'lodash'
import type { FormValues, Route } from '@/dex/components/PageRouterSwap/types'
import type { FormStatus } from '@/dex/components/PageRouterSwap/types'
import { Pool, PoolData } from '@/dex/types/main.types'
import type { IRouteStep } from '@curvefi/api/lib/interfaces'
import { log, LogStatus } from '@ui-kit/lib'

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

      if (lodash.isUndefined(pool)) {
        try {
          pool = getPool(route.poolId)
        } catch (error) {
          log('routerBestRouteAndOutput missing poolName', LogStatus.ERROR, route.poolId, error.message)
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
