import '@/global-extensions'
import CrvStaking from '@/loan/components/PageCrvUsdStaking/Page'
import Integrations from '@/loan/components/PageIntegrations/Page'
import CreateLoan from '@/loan/components/PageLoanCreate/Page'
import ManageLoan from '@/loan/components/PageLoanManage/Page'
import { Page as PegKeepersPage } from '@/loan/components/PagePegKeepers'
import { CrvUsdClientLayout } from '@/loan/CrvUsdClientLayout'
import Skeleton from '@mui/material/Skeleton'
import { createRoute } from '@tanstack/react-router'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

const { MinHeight } = SizesAndSpaces

const crvusdLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'crvusd',
  component: CrvUsdClientLayout,
})

const layoutProps = { getParentRoute: () => crvusdLayoutRoute }

export const crvusdRoutes = crvusdLayoutRoute.addChildren([
  createRoute({
    path: '/',
    /** Redirect is handled by the `RootLayout` component */
    component: () => <Skeleton width="100%" height={MinHeight.pageContent} />,
    head: () => ({
      meta: [{ title: 'crvUSD - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/crvusd/${network}/markets/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/beta-markets',
    loader: ({ params: { network } }) => redirectTo(`/llamalend/${network}/markets/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/disclaimer',
    component: () => <Disclaimer currentApp="crvusd" />,
    head: () => ({
      meta: [{ title: 'Risk Disclaimer - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/integrations',
    component: Integrations,
    head: () => ({
      meta: [{ title: 'Integrations - Curve' }],
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
    component: CreateLoan,
    head: ({ params }) => ({
      meta: [{ title: `Create - ${params.market} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/create',
    component: CreateLoan,
    head: ({ params }) => ({
      meta: [{ title: `Create - ${params.market} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/manage/$formType',
    component: ManageLoan,
    head: ({ params }) => ({
      meta: [{ title: `Manage - ${params.market} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/manage',
    component: ManageLoan,
    head: ({ params }) => ({
      meta: [{ title: `Manage - ${params.market} - Curve` }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/psr',
    component: PegKeepersPage,
    head: () => ({
      meta: [{ title: 'Peg Stability Reserves - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pegkeepers',
    loader: ({ params: { network } }) => redirectTo(`/crvusd/${network}/psr/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/scrvUSD',
    component: CrvStaking,
    head: () => ({
      meta: [{ title: 'Savings crvUSD - Curve' }],
    }),
    ...layoutProps,
  }),
])
