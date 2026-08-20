import { ReactNode, useEffect } from 'react'
import { ErrorPage } from '@evm-ui/pages/ErrorPage'
import { ErrorMessage } from '@evm-ui/shared/ui/ErrorMessage'
import { Box } from '@mui/material'
import { captureException } from '@sentry/react'
import { CatchBoundary } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/router-core'

const ErrorComponent = ({ error, reset, title }: ErrorComponentProps & { title: string }) => {
  useEffect(() => {
    captureException(error, {
      tags: { boundary: title },
      extra: { message: error.message, stack: error.stack },
    })
  }, [error, title])

  return <ErrorPage title={title} subtitle={error.message} resetError={reset} error={error} />
}

export const ErrorBoundary = ({
  children,
  title,
  subtitle,
  refreshData,
  inline,
}: {
  children: ReactNode
  title: string
  subtitle?: string
  refreshData?: () => Promise<unknown> | void
  inline?: boolean
}) => (
  <CatchBoundary
    getResetKey={() => 'reset'}
    errorComponent={({ error, reset }: ErrorComponentProps) =>
      inline ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <ErrorMessage
            title={title}
            subtitle={subtitle}
            error={error}
            refreshData={refreshData}
            sx={{ alignSelf: 'center' }}
          />
        </Box>
      ) : (
        <ErrorComponent error={error} reset={reset} title={title} />
      )
    }
  >
    {children}
  </CatchBoundary>
)
