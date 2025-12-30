import { AnalyticsLayout } from '@/analytics/AnalyticsLayout'
import { PageHome } from '@/analytics/components/PageHome'
import Skeleton from '@mui/material/Skeleton'
import { createRoute } from '@tanstack/react-router'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { rootRoute } from './root.routes'
import { createSharedRoutes } from './shared.routes'
import { redirectTo } from './util'

const { MinHeight } = SizesAndSpaces

const analyticsLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'analytics',
  component: AnalyticsLayout,
})

const layoutProps = { getParentRoute: () => analyticsLayoutRoute }

export const analyticsRoutes = analyticsLayoutRoute.addChildren([
  ...createSharedRoutes('analytics', layoutProps),
  createRoute({
    path: '/',
    component: () => <Skeleton width="100%" height={MinHeight.pageContent} />,
    head: () => ({
      meta: [{ title: 'Analytics - Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/analytics/${network}/home`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/home',
    component: PageHome,
    ...layoutProps,
  }),
])
