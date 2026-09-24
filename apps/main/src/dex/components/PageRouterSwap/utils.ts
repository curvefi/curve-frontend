import type { FormValues, FormStatus, Route } from '@/dex/components/PageRouterSwap/types'
import type { IRouteStep } from '@curvefi/api/lib/interfaces'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { log, LogStatus } from '@ui/lib/logging'

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
      let pool: PoolTemplate | undefined

      // Try catch is needed for non-existent router pool IDs like "WETH wrapper".
      // Possibly worth fixing, but this seems to be production-build behavior we shouldn't break.
      try {
        pool = getPool(route.poolId)
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        log('routerBestRouteAndOutput missing poolName', LogStatus.ERROR, route.poolId, error.message)
      }
      const poolName = pool ? pool.name : route.poolId

      if (pool?.isCrypto) {
        haveCryptoRoutes = true
      }

      return { ...route, name: poolName, routeUrlId: pool ? route.poolId : '' }
    })
  }

  return { haveCryptoRoutes, routes: parsedRoutes }
}
