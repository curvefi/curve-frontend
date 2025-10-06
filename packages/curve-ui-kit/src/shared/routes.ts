import { t } from '@ui-kit/lib/i18n'
import { AppPage, AppRoute, AppRoutes } from '@ui-kit/widgets/Header/types'

export const PAGE_INTEGRATIONS = '/integrations'
export const PAGE_LEGAL = '/legal'

export const DEX_ROUTES = {
  PAGE_SWAP: '/swap',
  PAGE_POOLS: '/pools',
  PAGE_CREATE_POOL: '/create-pool',
  PAGE_DASHBOARD: '/dashboard',
  PAGE_DEPLOY_GAUGE: '/deploy-gauge',
  PAGE_COMPENSATION: '/compensation',
  PAGE_LEGAL,
  PAGE_INTEGRATIONS,
}

export const LEND_ROUTES = {
  PAGE_MARKETS: '/markets',
  PAGE_LEGAL,
  PAGE_INTEGRATIONS,
}

export const CRVUSD_ROUTES = {
  PAGE_MARKETS: '/markets',
  PAGE_CRVUSD_STAKING: '/scrvUSD',
  PAGE_LEGAL,
  PAGE_PSR: '/psr',
  PAGE_INTEGRATIONS,
}

export const LLAMALEND_ROUTES = {
  PAGE_MARKETS: '/markets',
  PAGE_LEGAL,
  PAGE_INTEGRATIONS,
}

export const DAO_ROUTES = {
  PAGE_VECRV_CREATE: '/vecrv/create',
  PAGE_PROPOSALS: '/proposals',
  PAGE_GAUGES: '/gauges',
  PAGE_VECRV: '/vecrv',
  PAGE_ANALYTICS: '/analytics',
  PAGE_USER: '/user',
  DISCUSSION: 'https://gov.curve.finance/',
  PAGE_LEGAL,
  PAGE_INTEGRATIONS,
}

export const AppNames = ['dex', 'lend', 'crvusd', 'dao', 'llamalend'] as const
export type AppName = (typeof AppNames)[number]

export const AppMenuOptions = ['dex', 'llamalend', 'dao'] as const
export type AppMenuOption = (typeof AppMenuOptions)[number]

export const APP_LINK: Record<AppMenuOption, AppRoutes> = {
  dex: {
    label: 'DEX',
    routes: [
      { app: 'dex', route: DEX_ROUTES.PAGE_SWAP, label: () => t`Swap` },
      { app: 'dex', route: DEX_ROUTES.PAGE_POOLS, label: () => t`Pools` },
      { app: 'dex', route: DEX_ROUTES.PAGE_CREATE_POOL, label: () => t`Pool Creation` },
      { app: 'dex', route: DEX_ROUTES.PAGE_DASHBOARD, label: () => t`Dashboard` },
    ],
  },
  llamalend: {
    label: 'Llamalend',
    routes: [
      { app: 'llamalend', route: LLAMALEND_ROUTES.PAGE_MARKETS, label: () => t`Markets` },
      { app: 'crvusd', route: CRVUSD_ROUTES.PAGE_CRVUSD_STAKING, label: () => t`Savings crvUSD` },
      { app: 'crvusd', route: CRVUSD_ROUTES.PAGE_PSR, label: () => t`Peg Stability Reserves` },
    ],
  },
  dao: {
    label: 'DAO',
    routes: [
      { app: 'dao', route: DAO_ROUTES.PAGE_VECRV_CREATE, label: () => t`Lock CRV` },
      { app: 'dao', route: DAO_ROUTES.PAGE_PROPOSALS, label: () => t`Proposals` },
      { app: 'dao', route: DAO_ROUTES.PAGE_GAUGES, label: () => t`Gauges` },
      { app: 'dao', route: DAO_ROUTES.PAGE_ANALYTICS, label: () => t`Analytics` },
      { app: 'dao', route: DAO_ROUTES.DISCUSSION, label: () => t`Discussion`, target: '_blank' },
    ],
  },
}

/** Returns the full pathname for a given app and network */
export const getInternalUrl = (app: AppName, networkId: string, route: string = '/') => `/${app}/${networkId}${route}`

/** Converts a route to a page object, adding href and isActive properties */
export const routeToPage = (
  { route, target, label, app }: AppRoute,
  { networkId, pathname }: { networkId: string; pathname: string | null },
): AppPage => {
  const href = route.startsWith('http') ? route : getInternalUrl(app, networkId, route)
  return {
    href,
    target,
    label: label(),
    isActive: pathname?.startsWith(href.split('?')[0]),
  }
}

export const replaceNetworkInPath = (path: string, networkId: string) => {
  const [, app, _network, ...rest] = path.split('/')
  if (!app) return path // if no app, return original path
  return ['', app, networkId, ...rest].join('/')
}

export const getCurrentApp = (path: string | null): AppName => {
  const [, app] = path?.split('/') || []
  return AppNames.includes(app as AppName) ? (app as AppName) : 'dex'
}

export const getCurrentNetwork = (path: string | null): string => {
  const [, , networkId] = path?.split('/') || []
  return networkId
}
