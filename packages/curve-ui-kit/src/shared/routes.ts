import { t } from '@ui-kit/lib/i18n'
import type { AppPage, AppRoute, AppRoutes } from '@ui-kit/widgets/Header/types'

export const DEX_ROUTES = {
  PAGE_SWAP: '/swap',
  PAGE_POOLS: '/pools',
  PAGE_CREATE_POOL: '/create-pool',
  PAGE_DASHBOARD: '/dashboard',
}

export const LEND_ROUTES = {
  PAGE_MARKETS: '/markets',
  PAGE_DISCLAIMER: '/disclaimer',
}

export const CRVUSD_ROUTES = {
  PAGE_MARKETS: '/markets',
  BETA_PAGE_MARKETS: '/beta-markets',
  PAGE_CRVUSD_STAKING: '/scrvUSD',
  PAGE_DISCLAIMER: '/disclaimer',
  PAGE_PEGKEEPERS: '/pegkeepers',
}

export const DAO_ROUTES = {
  PAGE_VECRV_CREATE: '/vecrv/create',
  PAGE_PROPOSALS: '/proposals',
  PAGE_GAUGES: '/gauges',
  PAGE_VECRV: '/vecrv',
  PAGE_ANALYTICS: '/analytics',
  PAGE_USER: '/user',
  DISCUSSION: 'https://gov.curve.finance/',
  PAGE_DISCLAIMER: '/disclaimer',
}

export const AppNames = ['dex', 'lend', 'crvusd', 'dao'] as const
export type AppName = (typeof AppNames)[number]

export const AppMenuOptions = AppNames // llamalend contains links to crvusd and lend
export type AppMenuOption = (typeof AppMenuOptions)[number]

export const APP_LINK: Record<AppMenuOption, AppRoutes> = {
  dex: {
    label: 'DEX',
    routes: [
      { app: 'dex', route: DEX_ROUTES.PAGE_SWAP, label: () => t`Quickswap` },
      { app: 'dex', route: DEX_ROUTES.PAGE_POOLS, label: () => t`Pools` },
      { app: 'dex', route: DEX_ROUTES.PAGE_CREATE_POOL, label: () => t`Pool Creation` },
      { app: 'dex', route: DEX_ROUTES.PAGE_DASHBOARD, label: () => t`Dashboard` },
    ],
  },
  crvusd: {
    label: 'crvUSD',
    routes: [
      { app: 'crvusd', route: CRVUSD_ROUTES.PAGE_MARKETS, label: () => t`crvUSD` },
      { app: 'crvusd', route: CRVUSD_ROUTES.BETA_PAGE_MARKETS, label: () => t`Llama (beta)`, betaFeature: true },
      { app: 'crvusd', route: CRVUSD_ROUTES.PAGE_PEGKEEPERS, label: () => t`Peg Keepers` },
      { app: 'crvusd', route: CRVUSD_ROUTES.PAGE_CRVUSD_STAKING, label: () => t`Savings crvUSD` },
    ],
  },
  lend: {
    label: 'Lend',
    routes: [{ app: 'lend', route: LEND_ROUTES.PAGE_MARKETS, label: () => t`Lend` }],
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
