import { ReactNode } from 'react'
import { Box } from '@mui/material'
import { CatchBoundary } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/router-core'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { ErrorMessage } from '@ui-kit/shared/ui/ErrorMessage'

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
  refreshData?: () => void
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
            errorMessage={error.message}
            refreshData={refreshData}
            sx={{ alignSelf: 'center' }}
          />
        </Box>
      ) : (
        <ErrorPage title={title} subtitle={error.message} resetError={reset} error={error} />
      )
    }
  >
    {children}
  </CatchBoundary>
)
