import { StellarNetworkAwareLayout } from '@/routes/StellarNetworkAwareLayout'
import { createRootRoute } from '@tanstack/react-router'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'
import { t } from '@ui/lib/i18n'

export const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary title={t`Root route error`}>
      <StellarNetworkAwareLayout />
    </ErrorBoundary>
  ),
})
