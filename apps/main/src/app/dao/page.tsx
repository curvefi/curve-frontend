import { HashRouterRedirect } from '@ui-kit/shared/HashRouterRedirect'
import { DAO_ROUTES } from '@ui-kit/shared/routes'

export const metadata = {
  title: 'Curve.finance',
}

// old redirects that were hardcoded in the react-router routes. The network name gets added in the redirect.
const REDIRECTS = [
  DAO_ROUTES.PAGE_PROPOSALS,
  DAO_ROUTES.PAGE_USER,
  DAO_ROUTES.PAGE_GAUGES,
  DAO_ROUTES.PAGE_ANALYTICS,
  DAO_ROUTES.PAGE_VECRV,
]

const DaoRootPage = () => <HashRouterRedirect app="dao" redirects={REDIRECTS} />

export default DaoRootPage
