import { useMemo } from 'react'
import { StyleSheetManager } from 'styled-components'
import { WagmiProvider } from 'wagmi'
import { getNetworkDefs } from '@/dex/lib/networks'
import { GlobalLayout } from '@/routes/GlobalLayout'
import { recordValues } from '@curvefi/prices-api/objects.util'
import { OverlayProvider } from '@react-aria/overlays'
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { shouldForwardProp } from '@ui/styled-containers'
import { ConnectionProvider } from '@ui-kit/features/connect-wallet'
import { useWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/useWagmiConfig'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { usePathname } from '@ui-kit/hooks/router'
import { useLayoutStoreResponsive } from '@ui-kit/hooks/useLayoutStoreResponsive'
import { useNetworkFromUrl } from '@ui-kit/hooks/useNetworkFromUrl'
import { useOnChainUnavailable } from '@ui-kit/hooks/useOnChainUnavailable'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { t } from '@ui-kit/lib/i18n'
import { getCurrentApp } from '@ui-kit/shared/routes'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'

const RootLayout = () => {
  const networkDefs = rootRoute.useLoaderData() as Awaited<ReturnType<typeof getNetworkDefs>>
  const networks = useMemo(() => recordValues(networkDefs), [networkDefs])
  const network = useNetworkFromUrl(networks)
  const theme = useUserProfileStore((state) => state.theme)
  const currentApp = getCurrentApp(usePathname())
  const onChainUnavailable = useOnChainUnavailable(networks)
  useLayoutStoreResponsive()

  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <ThemeProvider theme={theme}>
        <OverlayProvider>
          <WagmiProvider config={useWagmiConfig(networks)}>
            <QueryProvider persister={persister} queryClient={queryClient}>
              {network && (
                <ErrorBoundary title={t`Layout error`}>
                  <ConnectionProvider app={currentApp} network={network} onChainUnavailable={onChainUnavailable}>
                    <GlobalLayout currentApp={currentApp} network={network} networks={networkDefs}>
                      <HeadContent />
                      <Outlet />
                      <TanStackRouterDevtools />
                    </GlobalLayout>
                  </ConnectionProvider>
                </ErrorBoundary>
              )}
            </QueryProvider>
          </WagmiProvider>
        </OverlayProvider>
      </ThemeProvider>
    </StyleSheetManager>
  )
}

export const rootRoute = createRootRoute({
  loader: getNetworkDefs,
  component: () => (
    <ErrorBoundary title={t`Root layout error`}>
      <RootLayout />
    </ErrorBoundary>
  ),
  // todo: head: () => ({meta: [{'og:image': CURVE_LOGO_URL, 'twitter:image': CURVE_LOGO_URL}]}),
})
