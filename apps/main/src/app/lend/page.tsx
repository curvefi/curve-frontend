import { HashRouterRedirect } from '@ui-kit/shared/HashRouterRedirect'
import { LEND_ROUTES } from '@ui-kit/shared/routes'

export const metadata = {
  title: 'Curve.finance',
}

// old redirects that were hardcoded in the react-router routes. The network name gets added in the redirect.
const REDIRECTS = [LEND_ROUTES.PAGE_MARKETS, LEND_ROUTES.PAGE_DISCLAIMER, LEND_ROUTES.PAGE_INTEGRATIONS]

const LendRootPage = () => <HashRouterRedirect app="lend" redirects={REDIRECTS} />

export default LendRootPage
