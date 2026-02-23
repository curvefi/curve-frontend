import type { MarketUrlParams } from '@/lend/types/lend.types'
import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'
import { redirectTo } from './util'

const LendLayout = lazyRouteComponent(() => import('@/lend/LendLayout'), 'LendLayout')
const LendMarketPage = lazyRouteComponent(
  () => import('@/lend/components/PageLendMarket/LendMarketPage'),
  'LendMarketPage',
)
const PageVault = lazyRouteComponent(() => import('@/lend/components/PageVault/Page'), 'Page')

const lendLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'lend',
  component: LendLayout,
})

const layoutProps = { getParentRoute: () => lendLayoutRoute }

export const lendRoutes = lendLayoutRoute.addChildren([
  ...createSharedRoutes('lend', layoutProps),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/lend/${network}/markets`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets',
    loader: ({ params: { network } }) => redirectTo(`/llamalend/${network}/markets`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market',
    component: LendMarketPage,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} - Curve Llamalend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/create/{-$formType}',
    loader: ({ params: { network, market } }: { params: MarketUrlParams }) =>
      redirectTo(`/lend/${network}/markets/${market}`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/manage/{-$formType}',
    loader: ({ params: { network, market } }: { params: MarketUrlParams }) =>
      redirectTo(`/lend/${network}/markets/${market}`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/vault/$formType',
    loader: ({ params: { network, market } }) => redirectTo(`/lend/${network}/markets/${market}/vault`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/vault',
    component: PageVault,
    head: ({ params }) => ({
      meta: [{ title: `Supply - ${params.market} - Curve Llamalend` }],
    }),
    ...layoutProps,
  }),
])
