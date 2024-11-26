export const _parseRouteAndIsActive = (
  pages: {
    route: string
    label: string
    isActive?: boolean
    target?: '_self' | '_blank'
    isDivider?: boolean
    groupedTitle?: string
    minWidth?: string
  }[],
  routerLocalePathname: string,
  routerPathname: string,
  routerNetwork: string | undefined
) => pages.map(({ route, ...rest }) => {
  const rPathname = routerPathname.split('?')[0] ?? ''
  const routePathname = route.split('?')[0] ?? ''
  const parsedRouterNetwork = routerNetwork || 'ethereum'

  return {
    route: route.startsWith('http')
      ? `${route}/#/${parsedRouterNetwork}`
      : `#${routerLocalePathname}/${parsedRouterNetwork}${route}`,
    isActive: rPathname && routePathname ? rPathname.endsWith(routePathname) : false,
    ...rest,
  }
})
