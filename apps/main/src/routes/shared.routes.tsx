import Skeleton from '@mui/material/Skeleton'
import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import type { AppName } from '@ui-kit/shared/routes'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { redirectTo } from './util'

const { MinHeight } = SizesAndSpaces
const LegalPage = lazyRouteComponent(() => import('@ui-kit/widgets/Legal'), 'LegalPage')
const Integrations = lazyRouteComponent(() => import('@ui-kit/features/integrations'), 'Integrations')

type LayoutProps = Pick<Parameters<typeof createRoute>[0], 'getParentRoute'>

/**
 * Creates shared routes that are common across all domain apps (dex, lend, crvusd, dao, etc).
 * These routes are not created on the root level; each app must add these routes to their own route tree
 */
export const createSharedRoutes = (app: AppName, layoutProps: LayoutProps) => [
  createRoute({
    path: '/',
    /** Redirect is handled by the `RootLayout` component */
    component: () => <Skeleton width="100%" height={MinHeight.pageContent} />,
    head: () => ({
      meta: [{ title: 'Curve' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/disclaimer',
    loader: ({ params: { network } }) => redirectTo(`/${app}/${network}/legal/?tab=disclaimers`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/legal',
    component: () => <LegalPage currentApp={app} />,
    head: () => ({
      meta: [{ title: 'Legal - Curve' }],
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
]
