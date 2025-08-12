import { lazy } from 'react'
import LendLayout from '@/app/lend/layout'
import { createRoute, Outlet } from '@tanstack/react-router'
import { rootRoute } from './root'
import { redirectTo } from './util'

export const lendLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'lend',
  component: () => (
    <LendLayout>
      <Outlet />
    </LendLayout>
  ),
})

const lendRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '/',
  component: lazy(() => import('../app/lend/page')),
  head: () => ({
    meta: [{ title: 'Lend - Curve' }],
  }),
})

const lendNetworkRedirectRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network',
  loader: ({ params: { network } }) => redirectTo(`/lend/${network}/markets/`),
})

const lendNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/disclaimer',
  component: lazy(() => import('../app/lend/[network]/disclaimer/page')),
  head: () => ({
    meta: [{ title: 'Risk Disclaimer - Curve Lend' }],
  }),
})

const lendNetworkIntegrationsRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/integrations',
  component: lazy(() => import('../app/lend/[network]/integrations/page')),
  head: () => ({
    meta: [{ title: 'Integrations - Curve Lend' }],
  }),
})

const lendNetworkMarketsRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets',
  component: lazy(() => import('../app/lend/[network]/markets/page')),
  head: () => ({
    meta: [{ title: 'Markets - Curve Lend' }],
  }),
})

const lendNetworkMarketCreateRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/create/$formType',
  component: lazy(() => import('../app/lend/[network]/markets/[market]/create/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `${params.market} | Create Loan - Curve Lend` }],
  }),
})

const lendNetworkMarketCreateNoFormTypeRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/create',
  component: lazy(() => import('../app/lend/[network]/markets/[market]/create/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `${params.market} | Create Loan - Curve Lend` }],
  }),
})

const lendNetworkMarketManageRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/manage/$formType',
  component: lazy(() => import('../app/lend/[network]/markets/[market]/manage/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `${params.market} | Manage Loan - Curve Lend` }],
  }),
})

const lendNetworkMarketManageNoFormTypeRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/manage',
  component: lazy(() => import('../app/lend/[network]/markets/[market]/manage/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `${params.market} | Manage Loan - Curve Lend` }],
  }),
})

const lendNetworkMarketVaultRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/vault/$formType',
  component: lazy(() => import('../app/lend/[network]/markets/[market]/vault/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `${params.market} | Supply - Curve Lend` }],
  }),
})

const lendNetworkMarketVaultNoFormTypeRoute = createRoute({
  getParentRoute: () => lendLayoutRoute,
  path: '$network/markets/$market/vault',
  component: lazy(() => import('../app/lend/[network]/markets/[market]/vault/[[...formType]]/page')),
  head: ({ params }) => ({
    meta: [{ title: `${params.market} | Supply - Curve Lend` }],
  }),
})

export const lendRoutes = lendLayoutRoute.addChildren([
  lendRoute,
  lendNetworkRedirectRoute,
  lendNetworkDisclaimerRoute,
  lendNetworkIntegrationsRoute,
  lendNetworkMarketsRoute,
  lendNetworkMarketCreateRoute,
  lendNetworkMarketCreateNoFormTypeRoute,
  lendNetworkMarketManageRoute,
  lendNetworkMarketManageNoFormTypeRoute,
  lendNetworkMarketVaultRoute,
  lendNetworkMarketVaultNoFormTypeRoute,
])
