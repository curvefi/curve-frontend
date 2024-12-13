import { AppRoutes } from 'curve-common/src/widgets/Header/types'
import { t } from '@lingui/macro'

export const DEX_ROUTES = {
  PAGE_SWAP: '/swap',
  PAGE_POOLS: '/pools',
  PAGE_CREATE_POOL: '/create-pool',
  PAGE_DASHBOARD: '/dashboard',
}

export const LEND_ROUTES = {
  PAGE_MARKETS: '/markets',
  PAGE_RISK_DISCLAIMER: '/risk-disclaimer',
}

export const CRVUSD_ROUTES = {
  PAGE_MARKETS: '/markets',
  PAGE_CRVUSD_STAKING: '/scrvUSD',
  PAGE_RISK_DISCLAIMER: '/risk-disclaimer',
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
    root: getAppRoot('curve.fi', 'dapp', 3000),
    label: 'DEX',
    pages: [
      { route: DEX_ROUTES.PAGE_SWAP, label: () => t`Quickswap` },
      { route: DEX_ROUTES.PAGE_POOLS, label: () => t`Pools` },
      { route: DEX_ROUTES.PAGE_CREATE_POOL, label: () => t`Pool Creation` },
      { route: DEX_ROUTES.PAGE_DASHBOARD, label: () => t`Dashboard` },
    ],
  },
  crvusd: {
    root: getAppRoot('crvusd.curve.fi', 'dapp-crvusd', 3001),
    label: 'crvUSD',
    pages: [
      { route: CRVUSD_ROUTES.PAGE_MARKETS, label: () => t`Markets` },
      { route: CRVUSD_ROUTES.PAGE_CRVUSD_STAKING, label: () => t`Savings crvUSD` },
      { route: CRVUSD_ROUTES.PAGE_RISK_DISCLAIMER, label: () => t`Risk Disclaimer` },
    ],
  },
  lend: {
    root: getAppRoot('lend.curve.fi', 'dapp-lend', 3003),
    label: 'Lend',
    pages: [
      { route: LEND_ROUTES.PAGE_MARKETS, label: () => t`Markets` },
      { route: LEND_ROUTES.PAGE_RISK_DISCLAIMER, label: () => t`Risk Disclaimer` },
    ],
  },
  dao: {
    root: getAppRoot('dao.curve.fi', 'dapp-dao', 3002),
    label: 'DAO',
    pages: [
      { route: DAO_ROUTES.PAGE_VECRV_CREATE, label: () => t`Lock CRV` },
      { route: DAO_ROUTES.PAGE_PROPOSALS, label: () => t`Proposals` },
      { route: DAO_ROUTES.PAGE_GAUGES, label: () => t`Gauges` },
      { route: DAO_ROUTES.PAGE_ANALYTICS, label: () => t`Analytics` },
    ],
  },
}

function getAppRoot(productionHost: string, previewPrefix: string, developmentPort: number) {
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:${developmentPort}`
  }
  const windowHost = typeof window === 'undefined' ? undefined : window.location.host
  if (windowHost?.startsWith('staging')) {
    return `https://staging${productionHost === 'curve.fi' ? `.${productionHost}` : `-${productionHost}`}/`
  }
  if (windowHost?.endsWith('curvefi.vercel.app')) {
    const branchPrefix = /curve-dapp(-lend|-crvusd|-dao)?-(.*)-curvefi.vercel.app/.exec(windowHost)?.[2]
    if (branchPrefix) {
      return `https://curve-${previewPrefix}-${branchPrefix}-curvefi.vercel.app`
    }
  }
  if (windowHost && !windowHost.endsWith('curve.fi')) {
    console.warn(`Unexpected host: ${windowHost}`)
  }
  return `https://${productionHost}`
}

export const externalAppUrl = (route: string, networkName: string | null, app: AppName) =>
  app ? `${APP_LINK[app].root}/#${networkName ? `/${networkName}` : ''}${route}` : `/#${route}`
