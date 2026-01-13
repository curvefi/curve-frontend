import { PageIntegrations } from '@/lend/components/PageIntegrations/Page'
import { LendMarketPage } from '@/lend/components/PageLendMarket/LendMarketPage'
import { Page as PageVault } from '@/lend/components/PageVault/Page'
import { LendLayout } from '@/lend/LendLayout'
import type { MarketUrlParams } from '@/lend/types/lend.types'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'
import { redirectTo } from './util'

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
    path: '$network/integrations',
    component: PageIntegrations,
    head: () => ({
      meta: [{ title: 'Integrations - Curve Lend' }],
    }),
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
