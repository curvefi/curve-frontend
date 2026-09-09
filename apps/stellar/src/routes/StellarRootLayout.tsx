import { type ReactNode } from 'react'
import MuiLink from '@mui/material/Link'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'
import { QueryProvider } from '@ui/features/queries/provider'
import { persister, queryClient } from '@ui/features/queries/query-client'
import { ThemeProvider } from '@ui/features/themes/ThemeProvider'
import { IS_CYPRESS } from '@ui/lib/env'
import { t } from '@ui/lib/i18n'

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
