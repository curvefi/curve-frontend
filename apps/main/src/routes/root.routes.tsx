import { createRootRoute } from '@tanstack/react-router'
import { t } from '@ui-kit/lib/i18n'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'
import { RootLayout } from './RootLayout'

export const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary title={t`Root layout error`}>
      <RootLayout />
    </ErrorBoundary>
  ),
  // todo: head: () => ({meta: [{'og:image': CURVE_LOGO_URL, 'twitter:image': CURVE_LOGO_URL}]}),
})
