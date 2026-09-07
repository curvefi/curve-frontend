import { EvmErrorBoundary } from '@evm-ui/widgets/EvmErrorBoundary'
import { createRootRoute } from '@tanstack/react-router'
import { t } from '@ui/lib/i18n'
import { NetworkAwareLayout } from './RootLayout'

export const rootRoute = createRootRoute({
  component: () => (
    <EvmErrorBoundary title={t`Root route error`}>
      <NetworkAwareLayout />
    </EvmErrorBoundary>
  ),
  // todo: head: () => ({meta: [{'og:image': CURVE_LOGO_URL, 'twitter:image': CURVE_LOGO_URL}]}),
})
