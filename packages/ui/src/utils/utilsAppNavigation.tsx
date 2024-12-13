import { AppRoute } from 'curve-common/src/widgets/Header/types'

export const _parseRouteAndIsActive = (
  pages: AppRoute[],
  routerLocalePathname: string,
  routerPathname: string,
  network: string | undefined,
) =>
  pages.map(({ route, label }) => {
    const rPathname = routerPathname.split('?')[0] ?? ''
    const routePathname = route.split('?')[0] ?? ''
    const parsedRouterNetwork = network || 'ethereum'

    return {
      route: `${routerLocalePathname}/${parsedRouterNetwork}${route}`,
      isActive: rPathname && routePathname ? rPathname.endsWith(routePathname) : false,
      label: label(),
    }
  })
