'use client'
import { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import GlobalStyle from '@/globalStyle'
import { OverlayProvider } from '@react-aria/overlays'
import { config } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-config'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { ChadCssProperties } from '@ui-kit/themes/typography'

export const ClientWrapper = ({ children, loading }: { children: ReactNode; loading: boolean }) => {
  const theme = useUserProfileStore((state) => state.theme)
  return (
    <div suppressHydrationWarning style={{ ...(theme === 'chad' && ChadCssProperties) }}>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <OverlayProvider>
          <QueryProvider persister={persister} queryClient={queryClient}>
            <WagmiProvider config={config}>{!loading && children}</WagmiProvider>
          </QueryProvider>
        </OverlayProvider>
      </ThemeProvider>
    </div>
  )
}
