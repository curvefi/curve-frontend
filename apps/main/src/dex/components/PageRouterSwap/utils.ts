import type { FormValues, FormStatus, Route } from '@/dex/components/PageRouterSwap/types'
import type { IRouteStep } from '@curvefi/api/lib/interfaces'
import type { PoolTemplate } from '@curvefi/api/lib/pools'

export const DEFAULT_FORM_STATUS: FormStatus = {
  isApproved: false,
  formProcessing: false,
  formTypeCompleted: '',
  step: '',
  error: '',
  swapError: '',
}

export const DEFAULT_FORM_VALUES: FormValues = { isFrom: null, fromAmount: '', fromError: '', toAmount: '' }

export function parseRouterRoutes(routes: IRouteStep[], getPool: (poolId: string) => PoolTemplate) {
  let haveCryptoRoutes = false
  let parsedRoutes: Route[] = []

  if (Array.isArray(routes) && routes.length > 0) {
    parsedRoutes = routes.map(route => {
      const pool = getPool(route.poolId)
      const poolName = pool ? pool.name : route.poolId

      if (pool?.isCrypto) {
        haveCryptoRoutes = true
      }

      return { ...route, name: poolName, routeUrlId: pool ? route.poolId : '' }
    })
  }

  return { haveCryptoRoutes, routes: parsedRoutes }
}
