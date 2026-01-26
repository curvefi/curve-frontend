import { ReactNode, useEffect } from 'react'
import { captureException } from '@sentry/react'
import { CatchBoundary } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/router-core'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'

const ErrorComponent = ({ error, reset, title }: ErrorComponentProps & { title: string }) => {
  useEffect(() => {
    captureException(error, {
      tags: { boundary: title },
      extra: { message: error.message, stack: error.stack },
    })
  }, [error, title])

  return <ErrorPage title={title} subtitle={error.message} resetError={reset} error={error} />
}

export const ErrorBoundary = ({ children, title }: { children: ReactNode; title: string }) => (
  <CatchBoundary
    getResetKey={() => 'reset'}
    errorComponent={({ error, reset }: ErrorComponentProps) => (
      <ErrorComponent error={error} reset={reset} title={title} />
    )}
  >
    {children}
  </CatchBoundary>
)
