import { HashRouterRedirect } from '@ui-kit/shared/HashRouterRedirect'

export const metadata = {
  title: 'Curve.finance',
}

// old redirects that were hardcoded in the react-router routes. The network name gets added in the redirect.
const REDIRECTS = ['/markets', '/disclaimer', '/integrations']

const LendRootPage = () => <HashRouterRedirect app="lend" redirects={REDIRECTS} />

export default LendRootPage
