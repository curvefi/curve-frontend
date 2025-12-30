import { createRoute } from '@tanstack/react-router'
import type { AppName } from '@ui-kit/shared/routes'
import { LegalPage } from '@ui-kit/widgets/Legal'
import { redirectTo } from './util'

type LayoutProps = Pick<Parameters<typeof createRoute>[0], 'getParentRoute'>

/**
 * Creates shared routes that are common across all domain apps (dex, lend, crvusd, dao, etc).
 * These routes are not created on the root level; each app must add these routes to their own route tree
 */
export const createSharedRoutes = (app: AppName, layoutProps: LayoutProps) => [
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
]
