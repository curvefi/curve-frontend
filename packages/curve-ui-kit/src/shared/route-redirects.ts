'use client'
import { type AppName, AppNames, CRVUSD_ROUTES, DAO_ROUTES, DEX_ROUTES, LEND_ROUTES } from './routes'

const defaultPages = { dex: 'pools', lend: 'markets', crvusd: 'markets', dao: 'proposals' }
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
}

/**
 * Get the redirect URL when no app or network is found.
 * This handles the old hash-based routing from react-router. We remove the hash and redirect to the new routes.
 * We also handle old redirects that were hardcoded in react-router.
 */
export function getHashRedirectUrl({ search, hash, origin }: Location) {
  const path = hash.replace(/^#\/?/, '')
  const [, app, network] = path.split('/')
  const destApp = AppNames.find((a) => a === app) ?? oldOrigins.find((app) => origin.startsWith(app)) ?? 'dex'
  const routes = OldRoutes[destApp]
  if (routes?.find((r) => r.startsWith(path))) {
    return `/${destApp}/ethereum/${path}${search}`
  }
  if (network == 'integrations') {
    return `/${destApp}/ethereum/${path ?? defaultPages[destApp]}`
  }
  return `/${destApp}/${path}${search}`
}
