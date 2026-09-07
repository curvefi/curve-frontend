import { type ReactNode } from 'react'
import MuiLink from '@mui/material/Link'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@ui/components/ThemeProvider'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'
import { QueryProvider } from '@ui/features/queries/provider'
import { persister, queryClient } from '@ui/features/queries/query-client'
import { t } from '@ui/lib/i18n'
import { IS_CYPRESS } from '@ui/utils/env'

const DEV_TOOLS = !IS_CYPRESS

export const StellarRootLayout = ({ children }: { children: ReactNode }) => {
  const theme = 'chad' as const
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary title={t`Root layout error`} LinkComponent={MuiLink}>
        <QueryProvider persister={persister} queryClient={queryClient}>
          {children}
          {DEV_TOOLS && <ReactQueryDevtools />}
        </QueryProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
