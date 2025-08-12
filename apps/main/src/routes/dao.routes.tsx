import { lazy } from 'react'
import DaoLayout from '@/app/dao/layout'
import { redirectTo } from '@/routes/util'
import { createRoute, Outlet } from '@tanstack/react-router'
import { rootRoute } from './root.routes'

const daoLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dao',
  component: () => (
    <DaoLayout>
      <Outlet />
    </DaoLayout>
  ),
})

const daoRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '/',
  component: lazy(() => import('../app/dao/page')),
  head: () => ({
    meta: [{ title: 'DAO - Curve' }],
  }),
})

const daoNetworkRedirectRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network',
  loader: ({ params: { network } }) => redirectTo(`/dao/${network}/proposals/`),
})

const daoNetworkIntegrationsRedirectRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/integrations',
  loader: ({ params: { network } }) => redirectTo(`/dex/${network}/integrations/`),
})

const daoNetworkAnalyticsRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/analytics',
  component: lazy(() => import('../app/dao/[network]/analytics/page')),
  head: () => ({
    meta: [{ title: 'Analytics - Curve' }],
  }),
})

const daoNetworkDisclaimerRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/disclaimer',
  component: lazy(() => import('../app/dao/[network]/disclaimer/page')),
  head: () => ({
    meta: [{ title: 'Risk Disclaimer - Curve' }],
  }),
})

const daoNetworkGaugesRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/gauges',
  component: lazy(() => import('../app/dao/[network]/gauges/page')),
  head: () => ({
    meta: [{ title: 'Gauges - Curve' }],
  }),
})

const daoNetworkGaugeDetailRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/gauges/$gaugeAddress',
  component: lazy(() => import('../app/dao/[network]/gauges/[gaugeAddress]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Gauge - ${params.gaugeAddress} - Curve` }],
  }),
})

const daoNetworkProposalsRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/proposals',
  component: lazy(() => import('../app/dao/[network]/proposals/page')),
  head: () => ({
    meta: [{ title: 'Proposals - Curve' }],
  }),
})

const daoNetworkProposalDetailRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/proposals/$proposalId',
  component: lazy(() => import('../app/dao/[network]/proposals/[proposalId]/page')),
  head: ({ params }) => ({
    meta: [{ title: `Proposal - ${params.proposalId} - Curve` }],
  }),
})

const daoNetworkUserRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/user/$userAddress',
  component: lazy(() => import('../app/dao/[network]/user/[userAddress]/page')),
  head: ({ params }) => ({
    meta: [{ title: `veCRV Holder - ${params.userAddress} - Curve` }],
  }),
})

const daoNetworkVecrvRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/vecrv/$formType',
  component: lazy(() => import('../app/dao/[network]/vecrv/[[...formType]]/page')),
  head: () => ({
    meta: [{ title: 'CRV Locker - Curve' }],
  }),
})

const daoNetworkVecrvNoFormTypeRedirectRoute = createRoute({
  getParentRoute: () => daoLayoutRoute,
  path: '$network/vecrv',
  loader: ({ params: { network } }) => redirectTo(`/dao/${network}/vecrv/create/`),
})

export const daoRoutes = daoLayoutRoute.addChildren([
  daoRoute,
  daoNetworkRedirectRoute,
  daoNetworkIntegrationsRedirectRoute,
  daoNetworkAnalyticsRoute,
  daoNetworkDisclaimerRoute,
  daoNetworkGaugesRoute,
  daoNetworkGaugeDetailRoute,
  daoNetworkProposalsRoute,
  daoNetworkProposalDetailRoute,
  daoNetworkUserRoute,
  daoNetworkVecrvRoute,
  daoNetworkVecrvNoFormTypeRedirectRoute,
])
