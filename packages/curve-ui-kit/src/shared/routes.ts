import { t } from '@ui-kit/lib/i18n'
import type { AppRoutes } from '@ui-kit/widgets/Header/types'

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
  DISCUSSION: 'https://gov.curve.fi/',
  PAGE_DISCLAIMER: '/disclaimer',
}

export const AppNames = ['dex', 'lend', 'crvusd', 'dao'] as const
export type AppName = (typeof AppNames)[number]

export const getAppRoot = (app: AppName) => `/${app}`

export const APP_LINK = {
  dex: {
    label: 'DEX',
    pages: [
      { app: 'dex', route: DEX_ROUTES.PAGE_SWAP, label: () => t`Quickswap` },
      { app: 'dex', route: DEX_ROUTES.PAGE_POOLS, label: () => t`Pools` },
      { app: 'dex', route: DEX_ROUTES.PAGE_CREATE_POOL, label: () => t`Pool Creation` },
      { app: 'dex', route: DEX_ROUTES.PAGE_DASHBOARD, label: () => t`Dashboard` },
    ],
  },
  llamalend: {
    label: 'Llamalend',
    pages: [
      { app: 'lend', route: LEND_ROUTES.PAGE_MARKETS, label: () => t`Lend` },
      { app: 'crvusd', route: CRVUSD_ROUTES.PAGE_MARKETS, label: () => t`Mint` },
      { app: 'crvusd', route: CRVUSD_ROUTES.BETA_PAGE_MARKETS, label: () => t`Markets (beta)` },
      { app: 'crvusd', route: CRVUSD_ROUTES.PAGE_PEGKEEPERS, label: () => t`Peg Keepers` },
      { app: 'crvusd', route: CRVUSD_ROUTES.PAGE_CRVUSD_STAKING, label: () => t`Savings crvUSD` },
    ],
  },
  dao: {
    label: 'DAO',
    pages: [
      { app: 'dao', route: DAO_ROUTES.PAGE_VECRV_CREATE, label: () => t`Lock CRV` },
      { app: 'dao', route: DAO_ROUTES.PAGE_PROPOSALS, label: () => t`Proposals` },
      { app: 'dao', route: DAO_ROUTES.PAGE_GAUGES, label: () => t`Gauges` },
      { app: 'dao', route: DAO_ROUTES.PAGE_ANALYTICS, label: () => t`Analytics` },
      { app: 'dao', route: DAO_ROUTES.DISCUSSION, label: () => t`Discussion`, target: '_blank' },
    ],
  },
} as const satisfies Record<string, AppRoutes>

export type AppMenuOption = keyof typeof APP_LINK

export const getInternalUrl = (app: AppName, networkName: string, route: string = '/') =>
  `${getAppRoot(app)}/${networkName}${route}`

export const findCurrentRoute = (pathname: string, pages: { route: string }[]) => {
  const [_, _app, _network, ...route] = pathname.split('/')
  const routePath = `/${route.join('/')}`
  return pages.find((p) => routePath.startsWith(p.route))?.route
}
