import { HashRouterRedirect } from '@ui-kit/shared/HashRouterRedirect'

export const metadata = {
  title: 'Curve.fi',
}

// old redirects that were hardcoded in the react-router routes. The network name gets added in the redirect.
const REDIRECTS = ['/markets', '/disclaimer', '/integrations']

const LendRootPage = () => <HashRouterRedirect app="dex" redirects={REDIRECTS} />

export default LendRootPage
