import '@/global-extensions'
import PageIntegrations from '@/lend/components/PageIntegrations/Page'
import PageLoanCreate from '@/lend/components/PageLoanCreate/Page'
import PageLoanManage from '@/lend/components/PageLoanManage/Page'
import PageVault from '@/lend/components/PageVault/Page'
import Skeleton from '@mui/material/Skeleton'
import { createRoute } from '@tanstack/react-router'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import { LendLayout } from '../lend/LendLayout'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

const { MinHeight } = SizesAndSpaces

const lendLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'lend',
  component: LendLayout,
})

const layoutProps = { getParentRoute: () => lendLayoutRoute }

export const lendRoutes = lendLayoutRoute.addChildren([
  createRoute({
    path: '/',
    component: () => <Skeleton width="100%" height={MinHeight.pageContent} />,
    head: () => ({
      meta: [{ title: 'Lend - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/lend/${network}/markets/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/disclaimer',
    component: () => <Disclaimer currentApp="lend" />,
    head: () => ({
      meta: [{ title: 'Risk Disclaimer - Curve Lend' }],
    }),
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
    loader: ({ params: { network } }) => redirectTo(`/llamalend/${network}/markets/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/create/$formType',
    component: PageLoanCreate,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Create Loan - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/create',
    component: PageLoanCreate,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Create Loan - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/manage/$formType',
    component: PageLoanManage,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Manage Loan - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/manage',
    component: PageLoanManage,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Manage Loan - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/vault/$formType',
    component: PageVault,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Supply - Curve Lend` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/vault',
    component: PageVault,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} | Supply - Curve Lend` }],
    }),
    ...layoutProps,
  }),
])
