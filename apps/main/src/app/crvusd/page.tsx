import { ROUTE } from '@/loan/constants'
import { HashRouterRedirect } from '@ui-kit/shared/HashRouterRedirect'

export const metadata = {
  title: 'Curve.fi',
}

// old redirects that were hardcoded in the react-router routes. The network name gets added in the redirect.
const REDIRECTS = [
  ROUTE.PAGE_MARKETS,
  ROUTE.PAGE_CRVUSD_STAKING,
  ROUTE.PAGE_DISCLAIMER,
  ROUTE.PAGE_PEGKEEPERS,
  ROUTE.PAGE_INTEGRATIONS,
].map((root) => `${root}/`)

const CrvUsdRootPage = () => <HashRouterRedirect app="crvusd" redirects={REDIRECTS} />

export default CrvUsdRootPage
