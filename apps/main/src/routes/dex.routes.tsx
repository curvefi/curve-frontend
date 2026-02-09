import { createRoute } from '@tanstack/react-router'
import { lazyNamedRouteComponent } from './lazy-route'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'
import { redirectTo } from './util'

const DexLayout = lazyNamedRouteComponent(() => import('@/dex/DexLayout'), 'DexLayout')
const PageCompensation = lazyNamedRouteComponent(
  () => import('@/dex/components/PageCompensation/Page'),
  'PageCompensation',
)
const PageCreatePool = lazyNamedRouteComponent(() => import('@/dex/components/PageCreatePool/Page'), 'PageCreatePool')
const PageDashboard = lazyNamedRouteComponent(() => import('@/dex/components/PageDashboard/Page'), 'PageDashboard')
const PageDeployGauge = lazyNamedRouteComponent(
  () => import('@/dex/components/PageDeployGauge/Page'),
  'PageDeployGauge',
)
const PagePoolList = lazyNamedRouteComponent(() => import('@/dex/components/PagePoolList/Page'), 'PagePoolList')
const PagePool = lazyNamedRouteComponent(() => import('@/dex/components/PagePool/Page'), 'PagePool')
const PageRouterSwap = lazyNamedRouteComponent(() => import('@/dex/components/PageRouterSwap/Page'), 'PageRouterSwap')

const dexLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dex',
  component: DexLayout,
})

const layoutProps = { getParentRoute: () => dexLayoutRoute }

export const dexRoutes = dexLayoutRoute.addChildren([
  ...createSharedRoutes('dex', layoutProps),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/dex/${network}/swap/`),
    ...layoutProps,
  }),
  createRoute({
    path: '/integrations',
    loader: () => redirectTo('/dex/ethereum/integrations/'),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/compensation',
    component: PageCompensation,
    head: () => ({
      meta: [{ title: 'Compensation - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/create-pool',
    component: PageCreatePool,
    head: () => ({
      meta: [{ title: 'Create Pool - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/dashboard',
    component: PageDashboard,
    head: () => ({
      meta: [{ title: 'Dashboard - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/deploy-gauge',
    component: PageDeployGauge,
    head: () => ({
      meta: [{ title: 'Deploy Gauge - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools',
    component: PagePoolList,
    head: () => ({
      meta: [{ title: 'Pools - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$poolIdOrAddress',
    loader: ({ params: { network, poolIdOrAddress } }) =>
      redirectTo(`/dex/${network}/pools/${poolIdOrAddress}/deposit/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$poolIdOrAddress/$formType',
    component: PagePool,
    head: ({ params }) => ({
      meta: [{ title: `Curve - Pool - ${params.poolIdOrAddress} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/swap',
    component: PageRouterSwap,
    head: () => ({
      meta: [{ title: 'Swap - Curve' }],
    }),
    ...layoutProps,
  }),
])
