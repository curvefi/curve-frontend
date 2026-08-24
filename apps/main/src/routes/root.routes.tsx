import type { NetworkMapping } from '@legacy-ui/utils'
import { createRootRouteWithContext } from '@tanstack/react-router'
import type { Maintenance } from '@ui-kit/features/maintenance/hooks/useMaintenance'
import { t } from '@ui-kit/lib/i18n'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'
import { NetworkAwareLayout } from './RootLayout'

export const rootRoute = createRootRouteWithContext<{ backendMaintenance: Maintenance; networks: NetworkMapping }>()({
  component: () => (
    <ErrorBoundary title={t`Root route error`}>
      <NetworkAwareLayout />
    </ErrorBoundary>
  ),
  // todo: head: () => ({meta: [{'og:image': CURVE_LOGO_URL, 'twitter:image': CURVE_LOGO_URL}]}),
})
