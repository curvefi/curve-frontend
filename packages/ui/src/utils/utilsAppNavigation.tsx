import { AppRoute } from 'curve-ui-kit/src/widgets/Header/types'

export const _parseRouteAndIsActive = (pages: AppRoute[], routerPathname: string | null, network: string | undefined) =>
  pages.map(({ route, label, target }) => {
    const rPathname = routerPathname?.split('?')[0] ?? ''
    const routePathname = route.split('?')[0] ?? ''
    const parsedRouterNetwork = network || 'ethereum'
    return {
      route: route.startsWith('http') ? route : `${parsedRouterNetwork}${route}`,
      isActive: rPathname && routePathname ? rPathname.endsWith(routePathname) : false,
      label: label(),
      target,
    }
  })
