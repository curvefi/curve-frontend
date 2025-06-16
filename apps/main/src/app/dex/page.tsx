import { HashRouterRedirect } from '@ui-kit/shared/HashRouterRedirect'
import { DEX_ROUTES } from '@ui-kit/shared/routes'

export const metadata = {
  title: 'Curve.finance',
}

// old redirects that were hardcoded in the react-router routes. The network name gets added in the redirect.
const REDIRECTS = [
  DEX_ROUTES.PAGE_DASHBOARD,
  DEX_ROUTES.PAGE_DEPLOY_GAUGE,
  DEX_ROUTES.PAGE_CREATE_POOL,
  DEX_ROUTES.PAGE_INTEGRATIONS,
  DEX_ROUTES.PAGE_POOLS,
  DEX_ROUTES.PAGE_SWAP,
  DEX_ROUTES.PAGE_COMPENSATION,
  DEX_ROUTES.PAGE_DISCLAIMER,
]

const DexRootPage = () => <HashRouterRedirect app="dex" redirects={REDIRECTS} />

export default DexRootPage
