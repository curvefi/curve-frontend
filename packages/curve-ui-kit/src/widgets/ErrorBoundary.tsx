import { ReactNode } from 'react'
import { CatchBoundary } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/router-core'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { errorFallback } from '@ui-kit/utils/error.util'

export const ErrorBoundary = ({ children, title }: { children: ReactNode; title: string }) => (
  <CatchBoundary
    getResetKey={() => 'reset'}
    errorComponent={({ error, reset }: ErrorComponentProps) => (
      <ErrorPage title={title} subtitle={error.message} resetError={reset} />
    )}
    onCatch={errorFallback}
  >
    {children}
  </CatchBoundary>
)
