import { AppRoutes } from '@ui-kit/widgets/Header/types'
import { t } from '@lingui/macro'
import { isBeta } from '@ui-kit/utils'

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
}

export const DAO_ROUTES = {
  PAGE_VECRV_CREATE: '/vecrv/create',
  PAGE_PROPOSALS: '/proposals',
  PAGE_GAUGES: '/gauges',
  PAGE_VECRV: '/vecrv',
  PAGE_ANALYTICS: '/analytics',
  PAGE_USER: '/user',
}

export const AppNames = ['main', 'lend', 'crvusd', 'dao'] as const
export type AppName = (typeof AppNames)[number]

export const APP_LINK: Record<AppName, AppRoutes> = {
  main: {
    root: getAppRoot('dex'),
    label: 'DEX',
    pages: [
      { route: DEX_ROUTES.PAGE_SWAP, label: () => t`Quickswap` },
      { route: DEX_ROUTES.PAGE_POOLS, label: () => t`Pools` },
      { route: DEX_ROUTES.PAGE_CREATE_POOL, label: () => t`Pool Creation` },
      { route: DEX_ROUTES.PAGE_DASHBOARD, label: () => t`Dashboard` },
    ],
  },
  crvusd: {
    root: getAppRoot('loan'),
    label: 'crvUSD',
    pages: [
      { route: CRVUSD_ROUTES.PAGE_MARKETS, label: () => t`Markets` },
      ...(isBeta ? [{ route: CRVUSD_ROUTES.BETA_PAGE_MARKETS, label: () => t`Llama (beta)` }] : []),
      { route: CRVUSD_ROUTES.PAGE_CRVUSD_STAKING, label: () => t`Savings crvUSD` },
      { route: `${CRVUSD_ROUTES.PAGE_DISCLAIMER}?tab=crvusd`, label: () => t`Risk Disclaimer` },
    ],
  },
  lend: {
    root: getAppRoot('lend'),
    label: 'Lend',
    pages: [
      { route: LEND_ROUTES.PAGE_MARKETS, label: () => t`Markets` },
      { route: `${LEND_ROUTES.PAGE_DISCLAIMER}?tab=lend`, label: () => t`Risk Disclaimer` },
    ],
  },
  dao: {
    root: getAppRoot('dao'),
    label: 'DAO',
    pages: [
      { route: DAO_ROUTES.PAGE_VECRV_CREATE, label: () => t`Lock CRV` },
      { route: DAO_ROUTES.PAGE_PROPOSALS, label: () => t`Proposals` },
      { route: DAO_ROUTES.PAGE_GAUGES, label: () => t`Gauges` },
      { route: DAO_ROUTES.PAGE_ANALYTICS, label: () => t`Analytics` },
    ],
  },
}

function getAppRoot(path: 'dex' | 'dao' | 'lend' | 'loan', developmentPort = 3000) {
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:${developmentPort}/${path}`
  }
  if (typeof window !== 'undefined') {
    const { host } = window.location
    if (host.startsWith('staging')) {
      return `https://staging.curve.fi/${path}`
    }
    if (host.endsWith('vercel.app')) {
      return `https://${host}/${path}`
    }
    if (!host.endsWith('curve.fi')) {
      console.warn(`Unexpected host: ${host}`)
    }
  }
  return `https://curve.fi/${path}`
}

export const externalAppUrl = (route: string, networkName: string | null, app: AppName) =>
  app ? `${APP_LINK[app].root}/#${networkName ? `/${networkName}` : ''}${route}` : `/#${route}`
