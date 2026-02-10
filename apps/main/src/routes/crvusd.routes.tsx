import { Page as CrvStaking } from '@/loan/components/PageCrvUsdStaking/Page'
import { MintMarketPage } from '@/loan/components/PageMintMarket/MintMarketPage'
import { Page as PegKeepersPage } from '@/loan/components/PagePegKeepers'
import { CrvUsdClientLayout } from '@/loan/CrvUsdClientLayout'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'
import { redirectTo } from './util'

const crvusdLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'crvusd',
  component: CrvUsdClientLayout,
})

const layoutProps = { getParentRoute: () => crvusdLayoutRoute }

export const crvusdRoutes = crvusdLayoutRoute.addChildren([
  ...createSharedRoutes('crvusd', layoutProps),
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
