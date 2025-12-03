import '@/global-extensions'
import PageIntegrations from '@/lend/components/PageIntegrations/Page'
import { LendMarketPage } from '@/lend/components/PageLendMarket/LendMarketPage'
import PageVault from '@/lend/components/PageVault/Page'
import { LendLayout } from '@/lend/LendLayout'
import type { MarketUrlParams } from '@/lend/types/lend.types'
import Skeleton from '@mui/material/Skeleton'
import { createRoute } from '@tanstack/react-router'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LegalPage } from '@ui-kit/widgets/Legal'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

const { MinHeight } = SizesAndSpaces

const lendLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'lend',
  component: LendLayout,
})

const layoutProps = { getParentRoute: () => lendLayoutRoute }

const RedirectToMarketPage = ({ params: { network, market } }: { params: MarketUrlParams }) =>
  redirectTo(`/lend/${network}/markets/${market}/manage`)

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
    loader: ({ params: { network } }) => redirectTo(`/lend/${network}/markets`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/disclaimer',
    loader: ({ params: { network } }) => redirectTo(`/lend/${network}/legal/?tab=disclaimers`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/legal',
    component: () => <LegalPage currentApp="lend" />,
    head: () => ({
      meta: [{ title: 'Legal - Curve Lend' }],
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
    loader: ({ params: { network } }) => redirectTo(`/llamalend/${network}/markets`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market',
    component: LendMarketPage,
    head: ({ params }) => ({
      meta: [{ title: `${params.market} - Curve Llamalend` }],
    }),
    ...layoutProps,
  }),
  createRoute({ path: '$network/markets/$market/create/{$-formType}', loader: RedirectToMarketPage, ...layoutProps }),
  createRoute({ path: '$network/markets/$market/manage/{$-formType}', loader: RedirectToMarketPage, ...layoutProps }),
  createRoute({
    path: '$network/markets/$market/vault/$formType',
    loader: ({ params: { network, market } }) => redirectTo(`/lend/${network}/markets/${market}/vault`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets/$market/vault',
    component: PageVault,
    head: ({ params }) => ({
      meta: [{ title: `Supply - ${params.market} - Curve Llamalend` }],
    }),
    ...layoutProps,
  }),
])
