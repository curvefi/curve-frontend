import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'
import { redirectTo } from './util'

const DaoLayout = lazyRouteComponent(() => import('@/dao/DaoLayout'), 'DaoLayout')
const PageAnalytics = lazyRouteComponent(() => import('@/dao/components/PageAnalytics/Page'), 'PageAnalytics')
const PageGauges = lazyRouteComponent(() => import('@/dao/components/PageGauges/Page'), 'PageGauges')
const PageGauge = lazyRouteComponent(() => import('@/dao/components/PageGauge/Page'), 'PageGauge')
const PageDao = lazyRouteComponent(() => import('@/dao/components/PageProposals/Page'), 'PageDao')
const PageProposal = lazyRouteComponent(() => import('@/dao/components/PageProposal/Page'), 'PageProposal')
const PageUser = lazyRouteComponent(() => import('@/dao/components/PageUser/Page'), 'PageUser')
const PageVeCrv = lazyRouteComponent(() => import('@/dao/components/PageVeCrv/Page'), 'PageVeCrv')

const daoLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dao',
  component: DaoLayout,
})

const layoutProps = { getParentRoute: () => daoLayoutRoute }

export const daoRoutes = daoLayoutRoute.addChildren([
  ...createSharedRoutes('dao', layoutProps),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/dao/${network}/proposals/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/analytics',
    component: PageAnalytics,
    head: () => ({
      meta: [{ title: 'Analytics - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/gauges',
    component: PageGauges,
    head: () => ({
      meta: [{ title: 'Gauges - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/gauges/$gaugeAddress',
    component: PageGauge,
    head: ({ params }) => ({
      meta: [{ title: `Gauge - ${params.gaugeAddress} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/proposals',
    component: PageDao,
    head: () => ({
      meta: [{ title: 'Proposals - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/proposals/$proposalId',
    component: PageProposal,
    head: ({ params }) => ({
      meta: [{ title: `Proposal - ${params.proposalId} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/user/$userAddress',
    component: PageUser,
    head: ({ params }) => ({
      meta: [{ title: `veCRV Holder - ${params.userAddress} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/vecrv/$formType',
    component: PageVeCrv,
    head: () => ({
      meta: [{ title: 'CRV Locker - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/vecrv',
    loader: ({ params: { network } }) => redirectTo(`/dao/${network}/vecrv/create/`),
    ...layoutProps,
  }),
])
