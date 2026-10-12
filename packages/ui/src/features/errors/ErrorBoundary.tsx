import { type ElementType, type ReactNode, useEffect } from 'react'
import { Box } from '@mui/material'
import type { Address } from '@primitives/address.utils'
import { captureException } from '@sentry/react'
import { CatchBoundary } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/router-core'
import { ErrorMessage } from '@ui/features/errors/ErrorMessage'
import { ErrorPage } from '@ui/features/errors/ErrorPage'
import { t } from '@ui/lib/i18n'

const ErrorComponent = ({
  error,
  reset,
  title,
  LinkComponent,
  userAddress,
}: ErrorComponentProps & { title: string; LinkComponent?: ElementType; userAddress?: Address }) => {
  useEffect(() => {
    captureException(error, {
      tags: { boundary: title },
      extra: error instanceof Error ? { message: error.message, stack: error.stack } : undefined,
    })
  }, [error, title])

  return (
    <ErrorPage
      title={title}
      subtitle={t`An unexpected error occurred`}
      resetError={reset}
      error={error}
      LinkComponent={LinkComponent}
      userAddress={userAddress}
    />
  )
}

export const ErrorBoundary = ({
  children,
  title,
  subtitle,
  refreshData,
  inline,
  LinkComponent,
  userAddress,
}: {
  children: ReactNode
  title: string
  subtitle?: string
  refreshData?: () => Promise<unknown> | void
  inline?: boolean
  LinkComponent?: ElementType
  userAddress?: Address
}) => (
  <CatchBoundary
    getResetKey={() => 'reset'}
    errorComponent={({ error, reset }: ErrorComponentProps) =>
      inline ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
          <ErrorMessage
            title={title}
            subtitle={subtitle}
            error={error}
            refreshData={refreshData}
            userAddress={userAddress}
            sx={{ alignSelf: 'center' }}
          />
        </Box>
      ) : (
        <ErrorComponent
          error={error}
          reset={reset}
          title={title}
          LinkComponent={LinkComponent}
          userAddress={userAddress}
        />
      )
    }
  >
    {children}
  </CatchBoundary>
)
