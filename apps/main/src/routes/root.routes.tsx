import { createRootRoute } from '@tanstack/react-router'
import { NetworkAwareLayout } from './RootLayout'

export const rootRoute = createRootRoute({
  component: NetworkAwareLayout,
  // todo: head: () => ({meta: [{'og:image': CURVE_LOGO_URL, 'twitter:image': CURVE_LOGO_URL}]}),
})
