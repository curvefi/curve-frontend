import '@/global-extensions'
import { PageAnalytics } from '@/dao/components/PageAnalytics/Page'
import { PageGauge } from '@/dao/components/PageGauge/Page'
import { PageGauges } from '@/dao/components/PageGauges/Page'
import { PageProposal } from '@/dao/components/PageProposal/Page'
import { PageDao } from '@/dao/components/PageProposals/Page'
import { PageUser } from '@/dao/components/PageUser/Page'
import { PageVeCrv } from '@/dao/components/PageVeCrv/Page'
import { DaoLayout } from '@/dao/DaoLayout'
import Skeleton from '@mui/material/Skeleton'
import { createRoute } from '@tanstack/react-router'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LegalPage } from '@ui-kit/widgets/Legal'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

const { MinHeight } = SizesAndSpaces

const daoLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dao',
  component: DaoLayout,
})

const layoutProps = { getParentRoute: () => daoLayoutRoute }

export const daoRoutes = daoLayoutRoute.addChildren([
  createRoute({
    path: '/',
    /** Redirect is handled by the `RootLayout` component */
    component: () => <Skeleton width="100%" height={MinHeight.pageContent} />,
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
    component: PageAnalytics,
    head: () => ({
      meta: [{ title: 'Analytics - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/disclaimer',
    loader: ({ params: { network } }) => redirectTo(`/dao/${network}/legal/?tab=disclaimers`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/legal',
    component: () => <LegalPage currentApp="dao" />,
    head: () => ({
      meta: [{ title: 'Legal - Curve DAO' }],
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
