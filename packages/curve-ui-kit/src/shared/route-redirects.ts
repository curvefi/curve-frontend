'use client'
import { type AppName, AppNames, CRVUSD_ROUTES, DAO_ROUTES, DEX_ROUTES, LEND_ROUTES, LLAMALEND_ROUTES } from './routes'

const defaultPages = { dex: 'pools', lend: 'markets', crvusd: 'markets', dao: 'proposals', llamalend: 'markets' }
const oldOrigins = ['lend', 'crvusd', 'dao'] as const

// old redirects that were hardcoded in the react-router routes. The network name gets added in the redirect.
const OldRoutes: Record<AppName, string[]> = {
  crvusd: [
    CRVUSD_ROUTES.PAGE_MARKETS,
    CRVUSD_ROUTES.PAGE_CRVUSD_STAKING,
    CRVUSD_ROUTES.PAGE_DISCLAIMER,
    CRVUSD_ROUTES.PAGE_PEGKEEPERS,
    CRVUSD_ROUTES.PAGE_INTEGRATIONS,
  ],
  dex: [
    DEX_ROUTES.PAGE_DASHBOARD,
    DEX_ROUTES.PAGE_DEPLOY_GAUGE,
    DEX_ROUTES.PAGE_CREATE_POOL,
    DEX_ROUTES.PAGE_INTEGRATIONS,
    DEX_ROUTES.PAGE_POOLS,
    DEX_ROUTES.PAGE_SWAP,
    DEX_ROUTES.PAGE_COMPENSATION,
    DEX_ROUTES.PAGE_DISCLAIMER,
  ],
  dao: [
    DAO_ROUTES.PAGE_PROPOSALS,
    DAO_ROUTES.PAGE_USER,
    DAO_ROUTES.PAGE_GAUGES,
    DAO_ROUTES.PAGE_ANALYTICS,
    DAO_ROUTES.PAGE_VECRV,
  ],
  lend: [LEND_ROUTES.PAGE_MARKETS, LEND_ROUTES.PAGE_DISCLAIMER, LEND_ROUTES.PAGE_INTEGRATIONS],
  llamalend: [LLAMALEND_ROUTES.PAGE_MARKETS, LLAMALEND_ROUTES.PAGE_DISCLAIMER, LLAMALEND_ROUTES.PAGE_INTEGRATIONS],
}

/**
 * Get the redirect URL when no app or network is found.
 * This handles the old hash-based routing from react-router. We remove the hash and redirect to the new routes.
 * We also handle old redirects that were hardcoded in react-router.
 */
export function getHashRedirectUrl({ pathname, search, hash, host }: Location) {
  const hashPath = hash.replace(/^#\/?/, '')
  const oldApp = oldOrigins.find(app => host.startsWith(app)) || (pathname === '/' && hashPath && 'dex')
  const [, app, network, ...rest] = `${oldApp ? `/${oldApp}` : ''}${pathname}${hashPath}`.split('/')
  if ([app, network].includes('integrations')) {
    // old routes directly to integrations
    return `/${app === 'integrations' ? 'dex' : app}/ethereum/integrations/${search}`
  }
  const appName = AppNames.includes(app as AppName) ? (app as AppName) : 'dex'
  const routes = OldRoutes[appName]
  if (network && routes?.find(r => r.startsWith(`/${network}`))) {
    // handle old routes without network (this code should only be called when network is not found)
    return `/${appName}/ethereum/${network}/${rest.join('/')}${search}`
  }
  const restPath = rest.filter(Boolean).length ? rest.join('/') : defaultPages[appName]
  return `/${app || 'dex'}/${network || 'ethereum'}/${restPath}${search}`
}
