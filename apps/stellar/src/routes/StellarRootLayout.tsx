import { type ReactNode } from 'react'
import { StellarWalletProvider } from '@/features/connect-wallet/StellarWalletProvider'
import GlobalStyles from '@mui/material/GlobalStyles'
import MuiLink from '@mui/material/Link'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'
import { QueryProvider } from '@ui/features/queries/provider'
import { persister, queryClient } from '@ui/features/queries/query-client'
import { ThemeProvider } from '@ui/features/themes/ThemeProvider'
import { useUserProfileStore } from '@ui/features/user-profile'
import { useBodyThemeClass } from '@ui/hooks/useBodyThemeClass'
import { useLayoutStoreResponsive } from '@ui/hooks/useLayoutStoreResponsive'
import { IS_CYPRESS } from '@ui/lib/env'
import { t } from '@ui/lib/i18n'

const DEV_TOOLS = !IS_CYPRESS

export const StellarRootLayout = ({ children }: { children: ReactNode }) => {
  const theme = useUserProfileStore(state => state.theme)
  useLayoutStoreResponsive()
  useBodyThemeClass()
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles
        styles={({ palette: { background, text } }) => ({
          body: { color: text.primary, backgroundColor: background.default },
        })}
      />
      <ErrorBoundary title={t`Root layout error`} LinkComponent={MuiLink}>
        <QueryProvider persister={persister} queryClient={queryClient}>
          <StellarWalletProvider>{children}</StellarWalletProvider>
          {DEV_TOOLS && <ReactQueryDevtools />}
        </QueryProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
