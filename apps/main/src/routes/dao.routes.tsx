import { PageAnalytics } from '@/dao/components/PageAnalytics/Page'
import { PageGauge } from '@/dao/components/PageGauge/Page'
import { PageGauges } from '@/dao/components/PageGauges/Page'
import { PageProposal } from '@/dao/components/PageProposal/Page'
import { PageDao } from '@/dao/components/PageProposals/Page'
import { PageUser } from '@/dao/components/PageUser/Page'
import { PageVeCrv } from '@/dao/components/PageVeCrv/Page'
import { DaoLayout } from '@/dao/DaoLayout'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'
import { redirectTo } from './util'

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
    path: '$network/integrations',
    loader: ({ params: { network } }) => redirectTo(`/dex/${network}/integrations/`),
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
