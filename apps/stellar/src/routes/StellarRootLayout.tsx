import { type ReactNode } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryProvider } from '@ui/features/queries/provider'
import { persister, queryClient } from '@ui/features/queries/query-client'
import { IS_CYPRESS } from '@ui/utils/env'

const DEV_TOOLS = !IS_CYPRESS

export const StellarRootLayout = ({ children }: { children?: ReactNode }) => (
  // <ThemeProvider theme="">
  // <ErrorBoundary title={t`Root layout error`} LinkComponent={MuiLink}>
  <QueryProvider persister={persister} queryClient={queryClient}>
    <HeadContent />
    {children ?? <Outlet />}
    {DEV_TOOLS && <TanStackRouterDevtools />}
    {DEV_TOOLS && <ReactQueryDevtools />}
  </QueryProvider>
  // </ErrorBoundary>
  // </ThemeProvider>
)
