import { ReactNode } from 'react'
import { CatchBoundary } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/router-core'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'

export const ErrorBoundary = ({
  children,
  title,
  customErrorComponent,
}: {
  children: ReactNode
  title: string
  customErrorComponent?: (props: ErrorComponentProps) => ReactNode
}) => (
  <CatchBoundary
    getResetKey={() => 'reset'}
    errorComponent={({ error, reset }: ErrorComponentProps) =>
      customErrorComponent?.({ error, reset }) ?? (
        <ErrorPage title={title} subtitle={error.message} resetError={reset} error={error} />
      )
    }
  >
    {children}
  </CatchBoundary>
)
