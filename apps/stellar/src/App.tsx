import { StrictMode } from 'react'
import { router } from '@/stellar/routes'
import { StellarRootLayout } from '@/stellar/routes/StellarRootLayout'
import MuiLink from '@mui/material/Link'
import { RouterProvider } from '@tanstack/react-router'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'
import { t } from '@ui/lib/i18n'
import './index.css'

export const StellarApp = () => (
  <ErrorBoundary title={t`Application error`} LinkComponent={MuiLink}>
    <StrictMode>
      <StellarRootLayout>
        <RouterProvider router={router} />
      </StellarRootLayout>
    </StrictMode>
  </ErrorBoundary>
)
