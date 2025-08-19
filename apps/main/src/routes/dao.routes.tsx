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

const layoutProps = { getParentRoute: () => daoLayoutRoute }

export const daoRoutes = daoLayoutRoute.addChildren([
  createRoute({
    path: '/',
    component: lazy(() => import('../app/dao/page')),
    head: () => ({
      meta: [{ title: 'DAO - Curve' }],
    }),
    ...layoutProps,
  }),
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
    component: lazy(() => import('../app/dao/[network]/analytics/page')),
    head: () => ({
      meta: [{ title: 'Analytics - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/disclaimer',
    component: lazy(() => import('../app/dao/[network]/disclaimer/page')),
    head: () => ({
      meta: [{ title: 'Risk Disclaimer - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/gauges',
    component: lazy(() => import('../app/dao/[network]/gauges/page')),
    head: () => ({
      meta: [{ title: 'Gauges - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/gauges/$gaugeAddress',
    component: lazy(() => import('../app/dao/[network]/gauges/[gaugeAddress]/page')),
    head: ({ params }) => ({
      meta: [{ title: `Gauge - ${params.gaugeAddress} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/proposals',
    component: lazy(() => import('../app/dao/[network]/proposals/page')),
    head: () => ({
      meta: [{ title: 'Proposals - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/proposals/$proposalId',
    component: lazy(() => import('../app/dao/[network]/proposals/[proposalId]/page')),
    head: ({ params }) => ({
      meta: [{ title: `Proposal - ${params.proposalId} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/user/$userAddress',
    component: lazy(() => import('../app/dao/[network]/user/[userAddress]/page')),
    head: ({ params }) => ({
      meta: [{ title: `veCRV Holder - ${params.userAddress} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/vecrv/$formType',
    component: lazy(() => import('../app/dao/[network]/vecrv/[[...formType]]/page')),
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
