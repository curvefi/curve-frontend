import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'
import { redirectTo } from './util'

const CrvUsdClientLayout = lazyRouteComponent(() => import('@/loan/CrvUsdClientLayout'), 'CrvUsdClientLayout')
const MintMarketPage = lazyRouteComponent(
  () => import('@/loan/components/PageMintMarket/MintMarketPage'),
  'MintMarketPage',
)
const PegKeepersPage = lazyRouteComponent(() => import('@/loan/components/PagePegKeepers'), 'Page')
const CrvStaking = lazyRouteComponent(() => import('@/loan/components/PageCrvUsdStaking/Page'), 'Page')

const crvusdLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'crvusd',
  component: CrvUsdClientLayout,
})

const layoutProps = { getParentRoute: () => crvusdLayoutRoute }

export const crvusdRoutes = crvusdLayoutRoute.addChildren([
  ...createSharedRoutes('crvusd', layoutProps),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/crvusd/${network}/markets/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/beta-markets',
    loader: ({ params: { network } }) => redirectTo(`/llamalend/${network}/markets/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets',
    loader: ({ params: { network } }) => redirectTo(`/llamalend/${network}/markets/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$collateralId',
    component: MintMarketPage,
    head: ({ params }) => ({ meta: [{ title: `${params.collateralId} - Curve Llamalend` }] }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$collateralId/create/{-$formType}',
    loader: ({ params: { network, collateralId } }) => redirectTo(`/crvusd/${network}/markets/${collateralId}`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$collateralId/manage/{-$formType}',
    loader: ({ params: { network, collateralId } }) => redirectTo(`/crvusd/${network}/markets/${collateralId}`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/psr',
    component: PegKeepersPage,
    head: () => ({
      meta: [{ title: 'Peg Stability Reserves - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pegkeepers',
    loader: ({ params: { network } }) => redirectTo(`/crvusd/${network}/psr/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/scrvUSD',
    component: CrvStaking,
    head: () => ({
      meta: [{ title: 'Savings crvUSD - Curve' }],
    }),
    ...layoutProps,
  }),
])
