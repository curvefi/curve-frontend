import { createRootRoute } from '@tanstack/react-router'
import { t } from '@evm-ui/lib/i18n'
import { ErrorBoundary } from '@evm-ui/widgets/ErrorBoundary'
import { RootLayout } from './RootLayout'

export const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary title={t`Root layout error`}>
      <RootLayout />
    </ErrorBoundary>
  ),
  // todo: head: () => ({meta: [{'og:image': CURVE_LOGO_URL, 'twitter:image': CURVE_LOGO_URL}]}),
})
