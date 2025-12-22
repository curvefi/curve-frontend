import '@/global-extensions'
import CrvStaking from '@/loan/components/PageCrvUsdStaking/Page'
import { PageIntegrations } from '@/loan/components/PageIntegrations/Page'
import { MintMarketPage } from '@/loan/components/PageMintMarket/MintMarketPage'
import { Page as PegKeepersPage } from '@/loan/components/PagePegKeepers'
import { CrvUsdClientLayout } from '@/loan/CrvUsdClientLayout'
import Skeleton from '@mui/material/Skeleton'
import { createRoute } from '@tanstack/react-router'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LegalPage } from '@ui-kit/widgets/Legal'
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
    loader: ({ params: { network } }) => redirectTo(`/crvusd/${network}/legal/?tab=disclaimers`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/legal',
    component: () => <LegalPage currentApp="crvusd" />,
    head: () => ({
      meta: [{ title: 'Legal - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/integrations',
    component: PageIntegrations,
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
    path: '$network/markets/$collateralId',
    component: MintMarketPage,
    head: ({ params }) => ({ meta: [{ title: `${params.collateralId} - Curve Llamalend` }] }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$collateralId/create/{-$formType}',
    loader: ({ params: { network, collateralId } }) => redirectTo(`/crvusd/${network}/markets/${collateralId}`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$collateralId/manage/{-$formType}',
    loader: ({ params: { network, collateralId } }) => redirectTo(`/crvusd/${network}/markets/${collateralId}`),
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
