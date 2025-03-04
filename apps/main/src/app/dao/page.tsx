import { HashRouterRedirect } from '@ui-kit/shared/HashRouterRedirect'

export const metadata = {
  title: 'Curve.fi',
}

// old redirects that were hardcoded in the react-router routes. The network name gets added in the redirect.
const REDIRECTS = ['/proposals/', '/user/', '/gauges/', '/analytics/', '/vecrv/']

const DaoRootPage = () => <HashRouterRedirect app="dao" redirects={REDIRECTS} />

export default DaoRootPage
