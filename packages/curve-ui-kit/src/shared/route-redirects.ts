import type { PartialRecord } from '@curvefi/primitives/objects.utils'
import { type ParsedLocation } from '@tanstack/router-core'
import { type AppName, AppNames, CRVUSD_ROUTES, DAO_ROUTES, DEX_ROUTES, LEND_ROUTES, LLAMALEND_ROUTES } from './routes'

const defaultPages: PartialRecord<AppName, string> = {
  dex: 'swap',
  lend: 'markets',
  crvusd: 'markets',
  dao: 'proposals',
  llamalend: 'markets',
  analytics: 'home',
}
const oldOrigins = ['lend', 'crvusd', 'dao'] as const

// old redirects that were hardcoded in the react-router routes. The network name gets added in the redirect.
const OldRoutes: Record<AppName, string[]> = {
  crvusd: [
    CRVUSD_ROUTES.PAGE_MARKETS,
    CRVUSD_ROUTES.PAGE_CRVUSD_STAKING,
    CRVUSD_ROUTES.PAGE_PSR,
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
  ],
  dao: [
    DAO_ROUTES.PAGE_PROPOSALS,
    DAO_ROUTES.PAGE_USER,
    DAO_ROUTES.PAGE_GAUGES,
    DAO_ROUTES.PAGE_ANALYTICS,
    DAO_ROUTES.PAGE_VECRV,
  ],
  lend: [LEND_ROUTES.PAGE_MARKETS, LEND_ROUTES.PAGE_INTEGRATIONS],
  llamalend: [LLAMALEND_ROUTES.PAGE_MARKETS, LLAMALEND_ROUTES.PAGE_INTEGRATIONS],
  bridge: [],
  analytics: [],
}

/**
 * Get the redirect URL when no app or network is found.
 * This handles the old hash-based routing from react-router. We remove the hash and redirect to the new routes.
 * We also handle old redirects that were hardcoded in react-router.
 */
export function getHashRedirectUrl({ pathname: path, search: query, hash }: ParsedLocation, networkId: string) {
  const { host } = window.location // host is not available in the tanstack router location
  const search = new URLSearchParams(query)
  const hashPath = hash.replace(/^\/?/, '') // note tanstack hash doesn't start with #, but window.location.hash does
  const pathname = path.endsWith('/') ? path : `${path}/` // the ending slash is only there in root routes
  const oldApp = oldOrigins.find((app) => host.startsWith(app)) || (pathname === '/' && hashPath && 'dex')
  const [, app, network, ...rest] = `${oldApp ? `/${oldApp}` : ''}${pathname}${hashPath}`.split('/')
  if ([app, network].includes('integrations')) {
    // old routes directly to integrations
    return `/${app === 'integrations' ? 'dex' : app}/${networkId}/integrations/${search}`
  }
  const appName = AppNames.includes(app as AppName) ? (app as AppName) : 'dex'
  const routes = OldRoutes[appName]
  if (network && routes?.find((r) => r.startsWith(`/${network}`))) {
    // handle old routes without network (this code should only be called when network is not found)
    return `/${appName}/${networkId}/${network}/${rest.join('/')}${search}`
  }
  const restPath = rest.filter(Boolean).length ? rest.join('/') : (defaultPages?.[appName] ?? '')
  return `/${app || 'dex'}/${network || networkId}/${restPath}${search}`
}
