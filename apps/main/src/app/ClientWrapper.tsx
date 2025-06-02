'use client'
import { ReactNode, useMemo } from 'react'
import { WagmiProvider } from 'wagmi'
import GlobalStyle from '@/globalStyle'
import { OverlayProvider } from '@react-aria/overlays'
import type { BaseConfig } from '@ui/utils'
import { createWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-config'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { ChadCssProperties } from '@ui-kit/themes/fonts'

export const ClientWrapper = <ChainId extends number, NetworkConfig extends BaseConfig>({
  children,
  loading,
  networks,
}: {
  children: ReactNode
  loading: boolean
  networks: Record<ChainId, NetworkConfig>
}) => {
  const theme = useUserProfileStore((state) => state.theme)
  const config = useMemo(() => createWagmiConfig(networks), [networks])
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
