import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from '@tanstack/react-router'
import { t } from '@ui-kit/lib/i18n'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'
import { router } from './routes'

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary title={t`Application error`}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </ErrorBoundary>,
)
