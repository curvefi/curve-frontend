import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StellarRootLayout } from '@/routes/StellarRootLayout'
import MuiLink from '@mui/material/Link'
import { RouterProvider } from '@tanstack/react-router'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'
import { initSentry } from '@ui/features/sentry'
import { t } from '@ui/lib/i18n'
import { router } from './routes'
import './index.css'

initSentry('curve-stellar')

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary title={t`Application error`} LinkComponent={MuiLink}>
    <StrictMode>
      <StellarRootLayout>
        <RouterProvider router={router} />
      </StellarRootLayout>
    </StrictMode>
  </ErrorBoundary>,
)
