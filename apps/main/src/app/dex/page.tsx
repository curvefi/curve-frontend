import { HashRouterRedirect } from '@ui-kit/shared/HashRouterRedirect'

export const metadata = {
  title: 'Curve.finance',
}

// old redirects that were hardcoded in the react-router routes. The network name gets added in the redirect.
const REDIRECTS = [
  '/dashboard',
  '/deploy-gauge',
  '/create-pool',
  '/integrations',
  '/pools/',
  '/swap',
  '/compensation',
  '/disclaimer',
]

const DexRootPage = () => <HashRouterRedirect app="dex" redirects={REDIRECTS} />

export default DexRootPage
