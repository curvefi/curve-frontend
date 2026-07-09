import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import type { AppName } from '@ui-kit/shared/routes'
import { Loading } from './Loading'
import { redirectTo } from './util'

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
    component: Loading, // Redirect is handled by the `useOnChainUnavailable` hook
    head: () => ({ meta: [{ title: 'Curve' }] }),
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
    head: () => ({ meta: [{ title: 'Legal - Curve' }] }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/integrations',
    component: Integrations,
    head: () => ({ meta: [{ title: 'Integrations - Curve' }] }),
    ...layoutProps,
  }),
]
