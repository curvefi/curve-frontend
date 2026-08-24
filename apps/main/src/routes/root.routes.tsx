import { t } from '@evm-ui/lib/i18n'
import { ErrorBoundary } from '@evm-ui/widgets/ErrorBoundary'
import { createRootRoute } from '@tanstack/react-router'
import { NetworkAwareLayout } from './RootLayout'

export const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary title={t`Root route error`}>
      <NetworkAwareLayout />
    </ErrorBoundary>
  ),
  // todo: head: () => ({meta: [{'og:image': CURVE_LOGO_URL, 'twitter:image': CURVE_LOGO_URL}]}),
})
